import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NFeDetailsDialog } from "./NFeDetailsDialog";

interface Shop {
  id: string;
  name: string;
  cnpj: string;
}

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
  shop_id: string;
  shops?: Shop;
}

interface NFeListProps {
  nfes: NFe[];
  onUpdate: () => void;
}

export function NFeList({ nfes, onUpdate }: NFeListProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedNfe, setSelectedNfe] = useState<NFe | null>(null);
  const { toast } = useToast();

  const updateNFe = async (
    id: string,
    field: "sent_to_accounting" | "is_paid" | "added_to_stock",
    value: boolean
  ) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from("notas_fiscais")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Status atualizado!",
        description: "O status da NFe foi atualizado com sucesso.",
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating NFe:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status da NFe.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (nfe: NFe) => {
    const completed = [
      nfe.sent_to_accounting,
      nfe.is_paid,
      nfe.added_to_stock,
    ].filter(Boolean).length;

    if (completed === 3) {
      return <Badge className="bg-success text-success-foreground">Completo</Badge>;
    } else if (completed > 0) {
      return <Badge className="bg-warning text-warning-foreground">Pendente</Badge>;
    }
    return <Badge variant="secondary">Novo</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas Fiscais Registradas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NFe</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Mês/Ano</TableHead>
                <TableHead className="text-center">Enviado</TableHead>
                <TableHead className="text-center">Pago</TableHead>
                <TableHead className="text-center">Estoque</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nfes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    Nenhuma NFe registrada ainda
                  </TableCell>
                </TableRow>
              ) : (
                nfes.map((nfe) => (
                  <TableRow
                    key={nfe.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedNfe(nfe)}
                  >
                    <TableCell className="font-medium">{nfe.nfe_number}</TableCell>
                    <TableCell>{nfe.shops?.name || "-"}</TableCell>
                    <TableCell>{nfe.supplier}</TableCell>
                    <TableCell>{formatCurrency(nfe.value)}</TableCell>
                    <TableCell>
                      {format(new Date(nfe.issue_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {nfe.month_year
                        ? (() => {
                            try {
                              if (/^\d{4}-\d{2}$/.test(nfe.month_year)) {
                                return format(
                                  new Date(nfe.month_year + "-01"),
                                  "MMM/yyyy",
                                  { locale: ptBR }
                                ).replace(/^\w/, (c) => c.toUpperCase());
                              }
                              return nfe.month_year;
                            } catch (error) {
                              return nfe.month_year;
                            }
                          })()
                        : "-"}
                    </TableCell>
                    <TableCell 
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={nfe.sent_to_accounting}
                        disabled={updating === nfe.id}
                        onCheckedChange={(checked) =>
                          updateNFe(nfe.id, "sent_to_accounting", !!checked)
                        }
                      />
                    </TableCell>
                    <TableCell 
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={nfe.is_paid}
                        disabled={updating === nfe.id}
                        onCheckedChange={(checked) =>
                          updateNFe(nfe.id, "is_paid", !!checked)
                        }
                      />
                    </TableCell>
                    <TableCell 
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={nfe.added_to_stock}
                        disabled={updating === nfe.id}
                        onCheckedChange={(checked) =>
                          updateNFe(nfe.id, "added_to_stock", !!checked)
                        }
                      />
                    </TableCell>
                    <TableCell>{getStatusBadge(nfe)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <NFeDetailsDialog
          nfe={selectedNfe}
          open={!!selectedNfe}
          onOpenChange={(open) => !open && setSelectedNfe(null)}
          onUpdate={onUpdate}
        />
      </CardContent>
    </Card>
  );
}
