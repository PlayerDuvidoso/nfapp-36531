import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface NFeFormProps {
  onSuccess: () => void;
  onClose?: () => void;
}

interface Shop {
  id: string;
  name: string;
  cnpj: string;
}

export function NFeForm({ onSuccess, onClose }: NFeFormProps) {
  const [formData, setFormData] = useState({
    nfe_number: "",
    supplier: "",
    value: "",
    issue_date: "",
    month_year: "",
    notes: "",
    shop_id: "",
  });
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("name");

      if (error) throw error;
      setShops(data || []);
      
      // Auto-select if only one shop
      if (data && data.length === 1) {
        setFormData(prev => ({ ...prev, shop_id: data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  const normalizeValue = (value: string): number => {
    // Replace comma with period for parsing
    const normalized = value.replace(',', '.');
    return parseFloat(normalized);
  };

  const parseMonthYear = (input: string): string => {
    if (/^\d{4}-\d{2}$/.test(input)) {
      return input;
    }

    const slashMatch = input.match(/^(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const month = slashMatch[1].padStart(2, '0');
      const year = slashMatch[2];
      return `${year}-${month}`;
    }

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

    return input;
  };

  const handleSubmit = async (keepOpen: boolean) => {
    if (!formData.nfe_number || !formData.supplier || !formData.value || !formData.shop_id) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Por favor, preencha todos os campos obrigatórios, incluindo a loja.",
        variant: "destructive",
      });
      return;
    }

    if (shops.length === 0) {
      toast({
        title: "Nenhuma loja cadastrada",
        description: "Cadastre pelo menos uma loja antes de adicionar NFes.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const parsedMonthYear = parseMonthYear(formData.month_year);
      
      const { error } = await supabase.from("notas_fiscais").insert({
        nfe_number: formData.nfe_number,
        supplier: formData.supplier,
        value: normalizeValue(formData.value),
        issue_date: formData.issue_date,
        month_year: parsedMonthYear,
        notes: formData.notes || null,
        shop_id: formData.shop_id,
      });

      if (error) throw error;

      const newCount = addedCount + 1;
      setAddedCount(newCount);
      toast({
        title: "NFe registrada!",
        description: "A nota fiscal foi registrada com sucesso.",
      });
      
      setFormData({
        nfe_number: "",
        supplier: "",
        value: "",
        issue_date: "",
        month_year: "",
        notes: "",
        shop_id: shops.length === 1 ? shops[0].id : "",
      });
      
      onSuccess();

      if (!keepOpen && onClose) {
        toast({
          title: "Concluído!",
          description: `${newCount} NFe(s) registrada(s) no total!`,
        });
        onClose();
      }
    } catch (error: any) {
      console.error("Error inserting NFe:", error);
      toast({
        title: "Erro ao registrar NFe",
        description: error.message || "Não foi possível registrar a nota fiscal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj: string): string => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  return (
    <form className="space-y-6">
      {addedCount > 0 && (
        <div className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
          ✓ {addedCount} NFe(s) registrada(s) nesta sessão
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shop_id">Loja *</Label>
          <Select
            value={formData.shop_id}
            onValueChange={(value) =>
              setFormData({ ...formData, shop_id: value })
            }
          >
            <SelectTrigger id="shop_id">
              <SelectValue placeholder="Selecione a loja" />
            </SelectTrigger>
            <SelectContent>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name} - {formatCNPJ(shop.cnpj)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nfe_number">Número da NFe *</Label>
          <Input
            id="nfe_number"
            value={formData.nfe_number}
            onChange={(e) =>
              setFormData({ ...formData, nfe_number: e.target.value })
            }
            placeholder="Ex: 123456789"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor *</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) =>
              setFormData({ ...formData, supplier: e.target.value })
            }
            placeholder="Nome do fornecedor"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valor (R$) *</Label>
          <Input
            id="value"
            type="text"
            inputMode="decimal"
            value={formData.value}
            onChange={(e) => {
              const value = e.target.value;
              // Allow numbers, comma, and period
              if (/^[\d,\.]*$/.test(value)) {
                setFormData({ ...formData, value });
              }
            }}
            placeholder="0,00 ou 0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issue_date">Data de Emissão *</Label>
          <Input
            id="issue_date"
            type="date"
            value={formData.issue_date}
            onChange={(e) =>
              setFormData({ ...formData, issue_date: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="month_year">Mês/Ano *</Label>
          <Input
            id="month_year"
            type="text"
            value={formData.month_year}
            onChange={(e) =>
              setFormData({ ...formData, month_year: e.target.value })
            }
            placeholder="Ex: 10/2025 ou Outubro/2025"
            required
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
  );
}
