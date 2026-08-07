"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface ChatMsg {
  id: string;
  canal: string;
  salaId: string | null;
  autor: string;
  conteudo: string;
  data: string;
  isAdmin: boolean;
}

export interface ChatSala {
  id: string;
  nome: string;
  criadoPor: string;
  senha: boolean;
  dataCriacao: string;
  totalMensagens: number;
}

function getAdminPwd(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("adminPwd") || "";
}

async function chatGet(action: string, params?: Record<string, string>) {
  const url = new URL("/api/chat", window.location.origin);
  url.searchParams.set("action", action);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString());
  const data = await res.json();
  if ("error" in data) throw new Error(data.error as string);
  return data;
}

async function chatPost(action: string, body: Record<string, unknown>) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json();
  if ("error" in data) throw new Error(data.error as string);
  return data;
}

export function useChat() {
  const [mensagens, setMensagens] = useState<ChatMsg[]>([]);
  const [salas, setSalas] = useState<ChatSala[]>([]);
  const [canalAtivo, setCanalAtivo] = useState("geral");
  const [salaAtiva, setSalaAtiva] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const lastIdRef = useRef<string | null>(null);
  const autoScrollRef = useRef(true);

  const loadMensagens = useCallback(async () => {
    try {
      const params: Record<string, string> = { canal: canalAtivo };
      if (salaAtiva) params.salaId = salaAtiva;
      if (lastIdRef.current) params.lastId = lastIdRef.current;

      const data = await chatGet("listMensagens", params);
      const msgs = (data as ChatMsg[]).map((m) => ({
        ...m,
        data: m.data instanceof Date ? m.data.toISOString() : m.data,
      }));

      if (!mountedRef.current) return;

      if (msgs.length > 0) {
        lastIdRef.current = msgs[msgs.length - 1].id;
      }

      setMensagens((prev) => {
        if (lastIdRef.current && prev.length > 0) {
          const prevIds = new Set(prev.map((m) => m.id));
          const newMsgs = msgs.filter((m) => !prevIds.has(m.id));
          return [...prev, ...newMsgs];
        }
        return msgs;
      });
    } catch {
      // silent
    }
  }, [canalAtivo, salaAtiva]);

  const loadSalas = useCallback(async () => {
    try {
      const data = await chatGet("listSalas");
      if (!mountedRef.current) return;
      setSalas(
        (data as ChatSala[]).map((s) => ({
          ...s,
          dataCriacao:
            s.dataCriacao instanceof Date
              ? s.dataCriacao.toISOString()
              : s.dataCriacao,
        }))
      );
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    lastIdRef.current = null;
    setMensagens([]);
    autoScrollRef.current = true;
    loadMensagens();
    const interval = setInterval(loadMensagens, 3000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [canalAtivo, salaAtiva, loadMensagens]);

  useEffect(() => {
    loadSalas();
    const interval = setInterval(loadSalas, 10000);
    return () => clearInterval(interval);
  }, [loadSalas]);

  useEffect(() => {
    if (isLoading) {
      Promise.all([loadMensagens(), loadSalas()]).finally(() => {
        if (mountedRef.current) setIsLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const sendMessage = useCallback(
    async (conteudo: string, autor: string) => {
      if (!conteudo.trim()) return;
      try {
        await chatPost("sendMessage", {
          canal: salaAtiva ? "sala" : canalAtivo,
          salaId: salaAtiva || undefined,
          conteudo: conteudo.trim(),
          autor: autor.trim(),
          isAdmin: !!getAdminPwd(),
        });
        loadMensagens();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao enviar");
      }
    },
    [canalAtivo, salaAtiva, loadMensagens]
  );

  const createSala = useCallback(
    async (nome: string, criadoPor: string, senha?: string) => {
      try {
        const result = await chatPost("createSala", {
          nome: nome.trim(),
          criadoPor: criadoPor.trim(),
          senha: senha || undefined,
        });
        toast.success("Sala criada!");
        loadSalas();
        return result as ChatSala;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao criar sala");
        throw e;
      }
    },
    [loadSalas]
  );

  const deleteMensagem = useCallback(
    async (id: string) => {
      try {
        await chatPost("deleteMensagem", { id, adminPassword: getAdminPwd() });
        setMensagens((prev) => prev.filter((m) => m.id !== id));
        toast.success("Mensagem removida.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao deletar");
      }
    },
    []
  );

  const deleteSala = useCallback(
    async (id: string) => {
      try {
        await chatPost("deleteSala", { id, adminPassword: getAdminPwd() });
        if (salaAtiva === id) {
          setSalaAtiva(null);
          setCanalAtivo("geral");
        }
        toast.success("Sala removida.");
        loadSalas();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao deletar sala");
      }
    },
    [salaAtiva, loadSalas]
  );

  const joinSala = useCallback((salaId: string, _senha?: string) => {
    lastIdRef.current = null;
    setSalaAtiva(salaId);
  }, []);

  const leaveSala = useCallback(() => {
    lastIdRef.current = null;
    setSalaAtiva(null);
  }, []);

  const switchCanal = useCallback((canal: string) => {
    lastIdRef.current = null;
    setSalaAtiva(null);
    setCanalAtivo(canal);
  }, []);

  return {
    mensagens,
    salas,
    canalAtivo,
    salaAtiva,
    isLoading,
    autoScrollRef,
    sendMessage,
    createSala,
    deleteMensagem,
    deleteSala,
    joinSala,
    leaveSala,
    switchCanal,
    setMensagens,
  };
}
