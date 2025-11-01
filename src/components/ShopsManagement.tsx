import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Store, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Shop {
  id: string;
  cnpj: string;
  name: string;
  created_at: string;
}

const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 14) {
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return value;
};

const validateCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, "");
  return numbers.length === 14;
};

export function ShopsManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState({ cnpj: "", name: "" });
  const { toast } = useToast();

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("name");

      if (error) throw error;
      setShops(data || []);
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast({
        title: "Erro ao carregar lojas",
        description: "Não foi possível carregar a lista de lojas.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCNPJ(formData.cnpj)) {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, insira um CNPJ válido com 14 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const cnpjNumbers = formData.cnpj.replace(/\D/g, "");
      
      if (editingShop) {
        const { error } = await supabase
          .from("shops")
          .update({ cnpj: cnpjNumbers, name: formData.name })
          .eq("id", editingShop.id);

        if (error) throw error;
        toast({
          title: "Loja atualizada!",
          description: "A loja foi atualizada com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("shops")
          .insert({ cnpj: cnpjNumbers, name: formData.name });

        if (error) throw error;
        toast({
          title: "Loja cadastrada!",
          description: "A loja foi cadastrada com sucesso.",
        });
      }

      setFormData({ cnpj: "", name: "" });
      setEditingShop(null);
      setDialogOpen(false);
      fetchShops();
    } catch (error: any) {
      console.error("Error saving shop:", error);
      toast({
        title: "Erro ao salvar loja",
        description: error.message || "Não foi possível salvar a loja.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({ cnpj: formatCNPJ(shop.cnpj), name: shop.name });
    setDialogOpen(true);
  };

  const handleDelete = async (shopId: string) => {
    try {
      const { error } = await supabase
        .from("shops")
        .delete()
        .eq("id", shopId);

      if (error) throw error;
      toast({
        title: "Loja excluída",
        description: "A loja foi excluída com sucesso.",
      });
      fetchShops();
    } catch (error: any) {
      console.error("Error deleting shop:", error);
      toast({
        title: "Erro ao excluir loja",
        description: error.message || "Não foi possível excluir a loja.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingShop(null);
    setFormData({ cnpj: "", name: "" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Gerenciar Lojas
            </CardTitle>
            <CardDescription>
              Cadastre e gerencie as lojas da empresa
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingShop(null)}>
                <Store className="mr-2 h-4 w-4" />
                Nova Loja
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingShop ? "Editar Loja" : "Nova Loja"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })
                    }
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Loja *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Loja Centro"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Salvando..." : editingShop ? "Atualizar" : "Cadastrar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {shops.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma loja cadastrada. Comece cadastrando sua primeira loja.
          </div>
        ) : (
          <div className="space-y-2">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{shop.name}</p>
                  <p className="text-sm text-muted-foreground">
                    CNPJ: {formatCNPJ(shop.cnpj)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(shop)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a loja "{shop.name}"? 
                          Esta ação não pode ser desfeita e todas as NFes vinculadas 
                          a esta loja também serão excluídas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(shop.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
