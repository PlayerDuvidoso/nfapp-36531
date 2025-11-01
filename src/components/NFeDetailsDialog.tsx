import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, Edit2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NFe {
  id: string;
  nfe_number: string;
  supplier: string;
  value: number;
  issue_date: string;
  month_year: string;
  sent_to_accounting: boolean;
  is_paid: boolean;
  added_to_stock: boolean;
  notes: string | null;
}

interface NFeDetailsDialogProps {
  nfe: NFe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export const NFeDetailsDialog = ({ nfe, open, onOpenChange, onUpdate }: NFeDetailsDialogProps) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  if (!nfe) return null;

  const handleEditNotes = () => {
    setEditedNotes(nfe.notes || "");
    setIsEditingNotes(true);
  };

  const handleCancelEdit = () => {
    setIsEditingNotes(false);
    setEditedNotes("");
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("notas_fiscais")
        .update({ notes: editedNotes || null })
        .eq("id", nfe.id);

      if (error) throw error;
      
      toast.success("Observações atualizadas!");
      setIsEditingNotes(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Erro ao atualizar observações");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatMonthYear = (monthYear: string) => {
    try {
      if (/^\d{4}-\d{2}$/.test(monthYear)) {
        return format(new Date(monthYear + "-01"), "MMMM 'de' yyyy", {
          locale: ptBR,
        }).replace(/^\w/, (c) => c.toUpperCase());
      }
      return monthYear;
    } catch (error) {
      return monthYear;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes da NFe {nfe.nfe_number}</DialogTitle>
          <DialogDescription>
            Visualize e edite as informações completas da nota fiscal
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fornecedor</p>
                <p className="font-medium">{nfe.supplier}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium text-lg">{formatCurrency(nfe.value)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Data de Emissão</p>
                <p className="font-medium">
                  {format(new Date(nfe.issue_date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mês/Ano</p>
                <p className="font-medium">{formatMonthYear(nfe.month_year)}</p>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-medium">Status do Processamento</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {nfe.sent_to_accounting ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={nfe.sent_to_accounting ? "font-medium" : "text-muted-foreground"}>
                    Enviado para Contabilidade
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {nfe.is_paid ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={nfe.is_paid ? "font-medium" : "text-muted-foreground"}>
                    Pagamento Realizado
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {nfe.added_to_stock ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={nfe.added_to_stock ? "font-medium" : "text-muted-foreground"}>
                    Adicionado ao Estoque
                  </span>
                </div>
              </div>
            </div>

            {/* Notes/Description Section */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Observações</p>
                {!isEditingNotes && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditNotes}
                    className="h-8"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
              
              {isEditingNotes ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Digite suas observações aqui..."
                    className="min-h-[120px]"
                    disabled={isSaving}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {nfe.notes ? (
                    <div className="bg-muted/50 rounded-md p-4">
                      <p className="text-sm whitespace-pre-wrap">{nfe.notes}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Sem observações registradas
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
