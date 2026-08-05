import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, X } from "lucide-react";

interface ProfitCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfitCalculator({ isOpen, onClose }: ProfitCalculatorProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [costSteel, setCostSteel] = useState("0");
  const [sellSteel, setSellSteel] = useState("0");
  const [craftTime, setCraftTime] = useState("0");

  const profitPerItem = Math.max(0, parseInt(sellSteel) - parseInt(costSteel));
  const totalProfit = profitPerItem * (parseInt(quantity) || 1);
  const profitPerHour =
    parseInt(craftTime) > 0
      ? (totalProfit / parseInt(craftTime)) * 60
      : totalProfit;

  const handleReset = () => {
    setItemName("");
    setQuantity("1");
    setCostSteel("0");
    setSellSteel("0");
    setCraftTime("0");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-orange-500 font-mono flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Lucro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-slate-300 text-sm">Nome do Item</Label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Ex: Carne Salgada"
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Quantidade</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="bg-slate-700 border-slate-600 text-slate-100 mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Tempo (minutos)</Label>
              <Input
                type="number"
                value={craftTime}
                onChange={(e) => setCraftTime(e.target.value)}
                placeholder="0"
                className="bg-slate-700 border-slate-600 text-slate-100 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Custo (Aço)</Label>
              <Input
                type="number"
                value={costSteel}
                onChange={(e) => setCostSteel(e.target.value)}
                placeholder="0"
                className="bg-slate-700 border-slate-600 text-slate-100 mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Venda (Aço)</Label>
              <Input
                type="number"
                value={sellSteel}
                onChange={(e) => setSellSteel(e.target.value)}
                placeholder="0"
                className="bg-slate-700 border-slate-600 text-slate-100 mt-1"
              />
            </div>
          </div>

          {/* Resultados */}
          <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 border border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Lucro por Item:</span>
              <span className="font-mono font-bold text-orange-400">
                {profitPerItem} $
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Lucro Total:</span>
              <span
                className={`font-mono font-bold text-lg ${
                  totalProfit > 0 ? "text-green-400" : "text-slate-400"
                }`}
              >
                {totalProfit} $
              </span>
            </div>
            {parseInt(craftTime) > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                <span className="text-slate-400 text-sm">Lucro/Hora:</span>
                <span
                  className={`font-mono font-bold ${
                    profitPerHour > 0 ? "text-green-400" : "text-slate-400"
                  }`}
                >
                  {Math.round(profitPerHour)} $/h
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              Limpar
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
