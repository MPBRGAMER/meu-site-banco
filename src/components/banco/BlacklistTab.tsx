"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ShieldAlert, User, FileText, Send, Check, X, Trash2,
  Clock, AlertCircle, ChevronDown, ChevronUp, Eye, Ban
} from "lucide-react";

interface BlacklistEntry {
  id: string;
  reporterName: string;
  targetName: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string | null;
  reviewNote?: string | null;
  dataCriacao: string;
  dataReview?: string | null;
}

interface BlacklistTabProps {
  isAdmin?: boolean;
}

export default function BlacklistTab({ isAdmin = false }: BlacklistTabProps) {
  const [approved, setApproved] = useState<BlacklistEntry[]>([]);
  const [pending, setPending] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [reporterName, setReporterName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Admin review state
  const [reviewNote, setReviewNote] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Auth headers helper
  const getAuthHeaders = () => {
    const pwd = sessionStorage.getItem("adminPwd");
    const modToken = sessionStorage.getItem("modToken");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (pwd) headers["x-admin-password"] = pwd;
    else if (modToken) headers["x-moderador-token"] = modToken;
    return headers;
  };

  const loadApproved = async () => {
    try {
      const res = await fetch("/api/blacklist");
      if (res.ok) {
        const data = await res.json();
        setApproved(data);
      }
    } catch {}
  };

  const loadPending = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch("/api/blacklist?status=pending", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPending(data);
      }
    } catch {}
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadApproved(), loadPending()]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [isAdmin]);

  const handleSubmit = async () => {
    if (!reporterName.trim() || !targetName.trim() || !reason.trim()) {
      toast.error("Preencha todos os campos!");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterName: reporterName.trim(),
          targetName: targetName.trim(),
          reason: reason.trim(),
        }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Pedido enviado! Aguardando aprovação do admin.");
      setReporterName(""); setTargetName(""); setReason("");
      loadAll();
    } catch {
      toast.error("Erro ao enviar pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "approve", id, reviewNote: reviewNote.trim() || undefined }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Entrada aprovada! Agora é visível para todos.");
      setReviewNote(""); setReviewingId(null);
      loadAll();
    } catch {
      toast.error("Erro ao aprovar.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "reject", id, reviewNote: reviewNote.trim() || undefined }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Pedido rejeitado.");
      setReviewNote(""); setReviewingId(null);
      loadAll();
    } catch {
      toast.error("Erro ao rejeitar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta entrada permanentemente?")) return;
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Entrada removida.");
      loadAll();
    } catch {
      toast.error("Erro ao remover.");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/10">
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Blacklist</h2>
          <p className="text-xs text-muted-foreground">Jogadores reportados pela comunidade</p>
        </div>
      </div>

      {/* Submit Form */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Send className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Reportar jogador</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Preencha com seu nome, o nome do jogador que deseja reportar e o motivo. Seu pedido será analisado pelo admin.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" /> Seu nome
            </label>
            <Input
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Ex: Player123"
              maxLength={50}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Ban className="w-3 h-3" /> Nome do jogador
            </label>
            <Input
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Ex: Scammer456"
              maxLength={50}
              className="h-9 text-sm"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" /> Motivo
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Descreva o motivo do report..."
            maxLength={500}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground">{reason.length}/500</span>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !reporterName.trim() || !targetName.trim() || !reason.trim()}
          className="w-full sm:w-auto gap-2"
        >
          {submitting ? (
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {submitting ? "Enviando..." : "Enviar pedido"}
        </Button>
      </div>

      {/* Admin: Pending Requests */}
      {isAdmin && pending.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
          <button
            onClick={() => setShowPending(!showPending)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-400">
                Pedidos pendentes ({pending.length})
              </h3>
            </div>
            {showPending ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
          </button>

          {showPending && (
            <div className="space-y-2">
              {pending.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-amber-500/20 bg-card p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-red-400">{entry.targetName}</span>
                        <span className="text-[10px] text-muted-foreground">reportado por</span>
                        <span className="text-xs text-muted-foreground">{entry.reporterName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.reason}</p>
                      <span className="text-[10px] text-muted-foreground">{formatDate(entry.dataCriacao)}</span>
                    </div>
                  </div>

                  {reviewingId === entry.id && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <Input
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Nota opcional (ex: prova verificada)"
                        className="h-8 text-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={() => handleApprove(entry.id)}
                      size="sm"
                      className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-3 h-3" /> Aprovar
                    </Button>
                    <Button
                      onClick={() => handleReject(entry.id)}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-3 h-3" /> Rejeitar
                    </Button>
                    <Button
                      onClick={() => setReviewingId(reviewingId === entry.id ? null : entry.id)}
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                    >
                      <FileText className="w-3 h-3" /> {reviewingId === entry.id ? "Fechar nota" : "Nota"}
                    </Button>
                    <Button
                      onClick={() => handleDelete(entry.id)}
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approved Blacklist */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold">
            Jogadores na blacklist {approved.length > 0 && `(${approved.length})`}
          </h3>
        </div>

        {approved.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <ShieldAlert className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum jogador na blacklist no momento.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Pedidos aprovados aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {approved.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-red-500/10 bg-card p-3 hover:border-red-500/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-red-400">{entry.targetName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">
                        Blacklisted
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-1.5">{entry.reason}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {entry.reporterName}
                      </span>
                      <span>{formatDate(entry.dataCriacao)}</span>
                      {entry.reviewedBy && (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" /> {entry.reviewedBy}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      title="Detalhes"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {expandedId === entry.id && (
                  <div className="mt-3 pt-2 border-t border-border space-y-1">
                    {entry.reviewNote && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Nota do admin:</span> {entry.reviewNote}
                      </p>
                    )}
                    {entry.dataReview && (
                      <p className="text-[10px] text-muted-foreground">
                        Revisado em {formatDate(entry.dataReview)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
