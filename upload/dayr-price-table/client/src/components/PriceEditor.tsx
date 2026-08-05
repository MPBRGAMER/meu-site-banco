import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { removeAccents } from "@/lib/removeAccents";
import { trpc } from "@/lib/trpc";

interface Item {
  id: string;
  name: string;
  steel: string;
  cement: string;
  rarity: "common" | "uncommon" | "rare";
  demand: "low" | "medium" | "high" | "very_high";
  notes: string;
}

interface Category {
  id: string;
  name: string;
  items: Item[];
}

interface PriceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onPriceUpdate?: () => void;
}

export function PriceEditor({ isOpen, onClose, categories, onPriceUpdate }: PriceEditorProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ steel: string; cement: string }>({
    steel: "",
    cement: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const updateMutation = trpc.prices.update.useMutation();

  const currentCategory = useMemo(
    () => categories.find((c) => c.id === activeCategory),
    [activeCategory, categories]
  );

  const filteredItems = useMemo(() => {
    if (!currentCategory) return [];
    const normalizedSearch = removeAccents(searchTerm);
    return currentCategory.items.filter((item) =>
      removeAccents(item.name).includes(normalizedSearch)
    );
  }, [currentCategory, searchTerm]);

  const handleEditStart = (item: Item) => {
    setEditingItem(item.id);
    setEditValues({
      steel: item.steel.split(":")[0],
      cement: item.cement.split(":")[0],
    });
  };

  const handleEditSave = async () => {
    if (!editingItem || !currentCategory) return;

    try {
      await updateMutation.mutateAsync({
        itemId: editingItem,
        steelPrice: parseInt(editValues.steel),
        cementPrice: parseInt(editValues.cement),
      });

      toast.success("Preço atualizado com sucesso!");
      setEditingItem(null);
      onPriceUpdate?.();
    } catch (error) {
      toast.error("Erro ao atualizar preço. Tente novamente.");
      console.error(error);
    }
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setEditValues({ steel: "", cement: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-500 font-mono flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editor de Preços
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-2">
            Edite os preços dos itens. As mudanças são salvas no servidor e sincronizadas para todos.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Busca */}
          <div>
            <Label className="text-slate-300 text-sm">Buscar Item</Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome do item..."
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 mt-1"
            />
          </div>

          {/* Abas de Categorias */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-3 gap-2 bg-slate-700 p-1">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                >
                  {cat.name.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">
                      Nenhum item encontrado.
                    </p>
                  ) : (
                    filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-slate-700 border-slate-600 p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="text-slate-100 font-medium">{item.name}</p>
                          {editingItem === item.id ? (
                            <div className="flex gap-2 mt-2">
                              <div className="flex-1">
                                <Label className="text-xs text-slate-400">Aço ($)</Label>
                                <Input
                                  type="number"
                                  value={editValues.steel}
                                  onChange={(e) =>
                                    setEditValues({ ...editValues, steel: e.target.value })
                                  }
                                  className="bg-slate-600 border-slate-500 text-slate-100 text-sm mt-1"
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs text-slate-400">Cimento (€)</Label>
                                <Input
                                  type="number"
                                  value={editValues.cement}
                                  onChange={(e) =>
                                    setEditValues({ ...editValues, cement: e.target.value })
                                  }
                                  className="bg-slate-600 border-slate-500 text-slate-100 text-sm mt-1"
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 mt-1">
                              Aço: <span className="text-orange-400 font-mono">{item.steel}</span> |
                              Cimento: <span className="text-teal-400 font-mono">{item.cement}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          {editingItem === item.id ? (
                            <>
                              <Button
                                onClick={handleEditSave}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={updateMutation.isPending}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={handleEditCancel}
                                size="sm"
                                variant="outline"
                                className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => handleEditStart(item)}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex gap-2 pt-4 border-t border-slate-700">
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
