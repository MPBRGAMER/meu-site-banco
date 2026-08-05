import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface PriceReporterProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{ id: string; name: string }>;
  onReportSuccess?: () => void;
}

export function PriceReporter({ isOpen, onClose, items, onReportSuccess }: PriceReporterProps) {
  const [selectedItem, setSelectedItem] = useState("");
  const [steelPrice, setSteelPrice] = useState("");
  const [cementPrice, setCementPrice] = useState("");
  const [nickname, setNickname] = useState(localStorage.getItem("playerNickname") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportMutation = trpc.prices.report.useMutation();
  const selectedItemData = items.find((item) => item.id === selectedItem);

  const handleSubmit = async () => {
    if (!selectedItem || !steelPrice || !cementPrice || !nickname) {
      toast.error("Preencha todos os campos!");
      return;
    }

    setIsSubmitting(true);

    try {
      await reportMutation.mutateAsync({
        itemId: selectedItem,
        playerNickname: nickname,
        steelPrice: parseInt(steelPrice),
        cementPrice: parseInt(cementPrice),
      });

      // Salvar nickname para próximos reportes
      localStorage.setItem("playerNickname", nickname);

      toast.success("Preço reportado com sucesso!");
      
      // Limpar formulário
      setSelectedItem("");
      setSteelPrice("");
      setCementPrice("");

      onReportSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Erro ao reportar preço. Tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-teal-400 font-mono flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Reportar Preço
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-2">
            Compartilhe os preços que você vê no jogo para ajudar a comunidade!
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Apelido */}
          <div>
            <Label className="text-slate-300 text-sm">Seu Apelido</Label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Digite seu apelido"
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 mt-1"
            />
          </div>

          {/* Item */}
          <div>
            <Label className="text-slate-300 text-sm">Item</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 mt-1">
                <SelectValue placeholder="Selecione um item" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-slate-100">
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preço em Aço */}
          <div>
            <Label className="text-slate-300 text-sm">Preço em Aço ($)</Label>
            <Input
              type="number"
              value={steelPrice}
              onChange={(e) => setSteelPrice(e.target.value)}
              placeholder="Ex: 10"
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 mt-1"
            />
          </div>

          {/* Preço em Cimento */}
          <div>
            <Label className="text-slate-300 text-sm">Preço em Cimento (€)</Label>
            <Input
              type="number"
              value={cementPrice}
              onChange={(e) => setCementPrice(e.target.value)}
              placeholder="Ex: 20"
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 mt-1"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4 border-t border-slate-700">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Enviando...</>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Reportar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
