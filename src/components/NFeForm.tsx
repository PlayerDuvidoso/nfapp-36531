import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NFeFormProps {
  onSuccess: () => void;
  onClose?: () => void;
}

export const NFeForm = ({ onSuccess, onClose }: NFeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [formData, setFormData] = useState({
    nfe_number: "",
    supplier: "",
    value: "",
    issue_date: "",
    month_year: "",
    notes: "",
  });

  const parseMonthYear = (input: string): string => {
    // If already in YYYY-MM format, return as-is
    if (/^\d{4}-\d{2}$/.test(input)) {
      return input;
    }

    // Handle MM/YYYY format
    const slashMatch = input.match(/^(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const month = slashMatch[1].padStart(2, '0');
      const year = slashMatch[2];
      return `${year}-${month}`;
    }

    // Handle text month format like "Outubro/2025"
    const monthNames: { [key: string]: string } = {
      'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
      'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
      'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };
    
    const textMatch = input.match(/^([a-zá-ú]+)\/(\d{4})$/i);
    if (textMatch) {
      const monthName = textMatch[1].toLowerCase();
      const year = textMatch[2];
      const monthNumber = monthNames[monthName];
      if (monthNumber) {
        return `${year}-${monthNumber}`;
      }
    }

    // If format not recognized, return as-is
    return input;
  };

  const handleSubmit = async (keepOpen: boolean) => {
    setLoading(true);

    try {
      const parsedMonthYear = parseMonthYear(formData.month_year);
      
      const { error } = await supabase.from("notas_fiscais").insert([
        {
          nfe_number: formData.nfe_number,
          supplier: formData.supplier,
          value: parseFloat(formData.value),
          issue_date: formData.issue_date,
          month_year: parsedMonthYear,
          notes: formData.notes || null,
        },
      ]);

      if (error) throw error;

      const newCount = addedCount + 1;
      setAddedCount(newCount);
      toast.success("NFe registrada com sucesso!");
      
      setFormData({
        nfe_number: "",
        supplier: "",
        value: "",
        issue_date: "",
        month_year: "",
        notes: "",
      });
      
      onSuccess();

      if (!keepOpen && onClose) {
        toast.success(`${newCount} NFe(s) registrada(s) no total!`);
        onClose();
      }
    } catch (error) {
      console.error("Error inserting NFe:", error);
      toast.error("Erro ao registrar NFe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {addedCount > 0 && (
        <div className="text-sm text-muted-foreground">
          ✓ {addedCount} NFe(s) registrada(s) nesta sessão
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nfe_number">Número da NFe</Label>
              <Input
                id="nfe_number"
                required
                value={formData.nfe_number}
                onChange={(e) =>
                  setFormData({ ...formData, nfe_number: e.target.value })
                }
                placeholder="Ex: 123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                required
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                required
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue_date">Data de Emissão</Label>
              <Input
                id="issue_date"
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month_year">Mês/Ano</Label>
              <Input
                id="month_year"
                type="text"
                required
                value={formData.month_year}
                onChange={(e) =>
                  setFormData({ ...formData, month_year: e.target.value })
                }
                placeholder="Ex: 10/2025 ou Outubro/2025"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Adicione observações sobre esta NFe"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Salvando..." : "Adicionar Mais"}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Salvando..." : "Salvar e Fechar"}
            </Button>
          </div>
        </form>
    </div>
  );
};
