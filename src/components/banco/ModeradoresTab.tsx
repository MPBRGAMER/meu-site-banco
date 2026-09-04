"use client";
import { useState, useEffect } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, X, Check, UserCog } from "lucide-react";

export interface Moderador {
  id: string;
  nome: string;
  usuario: string;
  permissoes: string[];
  ativo: boolean;
  criadoEm: string;
}

export const ALL_PERMISSIONS = [
  { id: "emprestimos", label: "Empréstimos" },
  { id: "trocas", label: "Trocas" },
  { id: "doadores", label: "Doadores" },
  { id: "leiloes", label: "Leilões" },
  { id: "sorteios", label: "Sorteios" },
  { id: "loterica", label: "Lotérica" },
  { id: "chat", label: "Chat Admin" },
  { id: "tabela", label: "Tabela" },
  { id: "blacklist", label: "Blacklist" },
  { id: "investidores", label: "Investidores" },
  { id: "config-trocas", label: "Config Trocas" },
  { id: "compras-vendas", label: "Compras & Vendas" },
  { id: "caixa", label: "Estoque & Caixa" },
];

export default function ModeradoresTab() {
  const [mods, setMods] = useState<Moderador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formUsuario, setFormUsuario] = useState("");
  const [formSenha, setFormSenha] = useState("");
  const [formPerms, setFormPerms] = useState<string[]>([]);

  const loadMods = async () => {
    try {
      const res = await fetch("/api/banco", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": sessionStorage.getItem("adminPwd") || "" },
        body: JSON.stringify({ action: "listModeradores" }),
      });
      if (res.ok) {
        const data = await res.json();
        setMods(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadMods(); }, []);

  const resetForm = () => {
    setFormNome(""); setFormUsuario(""); setFormSenha("");
    setFormPerms([]); setShowCreate(false); setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formNome.trim() || !formUsuario.trim() || !formSenha.trim()) {
      toast.error("Preencha todos os campos!"); return;
    }
    try {
      const res = await fetch("/api/banco", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": sessionStorage.getItem("adminPwd") || "" },
        body: JSON.stringify({ action: "createModerador", nome: formNome.trim(), usuario: formUsuario.trim(), senha: formSenha, permissoes: formPerms }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success(`Moderador "${formNome}" criado! Entregue o usuário e senha para ele.`);
      resetForm(); loadMods();
    } catch { toast.error("Erro ao criar moderador."); }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const res = await fetch("/api/banco", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": sessionStorage.getItem("adminPwd") || "" },
        body: JSON.stringify({ action: "updateModerador", id: editingId, nome: formNome || undefined, permissoes: formPerms }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Moderador atualizado!");
      resetForm(); loadMods();
    } catch { toast.error("Erro ao atualizar."); }
  };

  const handleToggleActive = async (mod: Moderador) => {
    try {
      const res = await fetch("/api/banco", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": sessionStorage.getItem("adminPwd") || "" },
        body: JSON.stringify({ action: "updateModerador", id: mod.id, ativo: !mod.ativo }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success(mod.ativo ? `${mod.nome} desativado.` : `${mod.nome} ativado.`);
      loadMods();
    } catch { toast.error("Erro ao alterar status."); }
  };

  const handleDelete = async (mod: Moderador) => {
    if (!confirm(`Remover moderador "${mod.nome}"?`)) return;
    try {
      const res = await fetch("/api/banco", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": sessionStorage.getItem("adminPwd") || "" },
        body: JSON.stringify({ action: "removeModerador", id: mod.id }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success(`Moderador "${mod.nome}" removido.`);
      loadMods();
    } catch { toast.error("Erro ao remover."); }
  };

  const startEdit = (mod: Moderador) => {
    setEditingId(mod.id); setFormNome(mod.nome);
    setFormUsuario(mod.usuario); setFormSenha("");
    setFormPerms([...mod.permissoes]); setShowCreate(false);
  };

  const togglePerm = (permId: string) => {
    setFormPerms(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  if (loading) return <div className="text-center text-muted-foreground py-10">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2"><UserCog className="w-5 h-5" /> Moderadores</h2>
        {!showCreate && !editingId && (
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> Novo Moderador
          </Button>
        )}
      </div>

      {(showCreate || editingId) && (
        <div className="rounded-lg border border-primary/20 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-primary">{editingId ? "Editar Moderador" : "Novo Moderador"}</h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Nome de exibição</label>
              <Input value={formNome} onChange={e => setFormNome(e.target.value)} placeholder="Ex: João" className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Usuário (login)</label>
              <Input value={formUsuario} onChange={e => setFormUsuario(e.target.value)} placeholder="Ex: joao123" disabled={!!editingId} className="h-8 text-sm" />
            </div>
          </div>
          {!editingId && (
            <div>
              <label className="text-xs text-muted-foreground">Senha inicial</label>
              <Input type="text" value={formSenha} onChange={e => setFormSenha(e.target.value)} placeholder="Senha provisória (ele vai trocar depois)" className="h-8 text-sm" />
              <p className="text-[10px] text-muted-foreground mt-1">O moderador poderá alterar a senha no primeiro login.</p>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground">Permissões (marque as abas que ele pode administrar):</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {ALL_PERMISSIONS.map(perm => (
                <button
                  key={perm.id}
                  onClick={() => togglePerm(perm.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    formPerms.includes(perm.id)
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {formPerms.includes(perm.id) && "✓ "}{perm.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={resetForm} className="flex-1 text-xs h-8">Cancelar</Button>
            <Button onClick={editingId ? handleUpdate : handleCreate} className="flex-1 text-xs h-8 bg-primary text-primary-foreground">
              {editingId ? <><Check className="w-3.5 h-3.5" /> Salvar</> : <><Plus className="w-3.5 h-3.5" /> Criar</>}
            </Button>
          </div>
        </div>
      )}

      {mods.length === 0 && !showCreate && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nenhum moderador cadastrado.<br />
          Clique em "Novo Moderador" para começar.
        </div>
      )}

      <div className="space-y-2">
        {mods.map(mod => (
          <div key={mod.id} className={`rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-2 ${!mod.ativo ? "opacity-50 border-border" : "border-border"}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{mod.nome}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">@{mod.usuario}</span>
                {!mod.ativo && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">Inativo</span>}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {mod.permissoes.map(p => {
                  const perm = ALL_PERMISSIONS.find(ap => ap.id === p);
                  return perm ? (
                    <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{perm.label}</span>
                  ) : null;
                })}
                {mod.permissoes.length === 0 && <span className="text-[10px] text-muted-foreground">Sem permissões</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => startEdit(mod)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground" title="Editar permissões"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => handleToggleActive(mod)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground" title={mod.ativo ? "Desativar" : "Ativar"}>
                <Check className={`w-4 h-4 ${mod.ativo ? "text-green-500" : ""}`} />
              </button>
              <button onClick={() => handleDelete(mod)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400" title="Remover"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
