import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NFeForm } from "@/components/NFeForm";
import { NFeList } from "@/components/NFeList";
import { DashboardStats } from "@/components/DashboardStats";
import { ShopsManagement } from "@/components/ShopsManagement";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Plus, Store } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const Index = () => {
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [filteredNfes, setFilteredNfes] = useState<NFe[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shopFilter, setShopFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("name");

      if (error) throw error;
      setShops(data || []);
      
      // Reset shop filter if currently selected shop no longer exists
      if (shopFilter !== "all" && data) {
        const shopExists = data.some(shop => shop.id === shopFilter);
        if (!shopExists) {
          setShopFilter("all");
        }
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  const fetchNFes = async () => {
    try {
      const { data, error } = await supabase
        .from("notas_fiscais")
        .select("*, shops(*)")
        .order("issue_date", { ascending: false });

      if (error) throw error;
      setNfes(data || []);
      setFilteredNfes(data || []);
    } catch (error) {
      console.error("Error fetching NFes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
    fetchNFes();
  }, []);

  const getStatusType = (nfe: NFe): "new" | "pending" | "complete" => {
    const completed = [nfe.sent_to_accounting, nfe.is_paid, nfe.added_to_stock].filter(Boolean).length;
    if (completed === 0) return "new";
    if (completed === 3) return "complete";
    return "pending";
  };

  useEffect(() => {
    let filtered = nfes;
    
    // Apply shop filter
    if (shopFilter && shopFilter !== "all") {
      filtered = filtered.filter((nfe) => nfe.shop_id === shopFilter);
    }
    
    // Apply month filter
    if (monthFilter && monthFilter !== "all") {
      filtered = filtered.filter((nfe) => nfe.month_year === monthFilter);
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((nfe) => getStatusType(nfe) === statusFilter);
    }
    
    setFilteredNfes(filtered);
  }, [shopFilter, monthFilter, statusFilter, nfes]);

  // Get unique months from NFes data
  const uniqueMonths = Array.from(
    new Set(nfes.map((nfe) => nfe.month_year).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a)); // Sort newest first

  const formatMonthForDisplay = (monthYear: string): string => {
    try {
      if (/^\d{4}-\d{2}$/.test(monthYear)) {
        return format(new Date(monthYear + "-01"), "MMMM/yyyy", {
          locale: ptBR,
        }).replace(/^\w/, (c) => c.toUpperCase());
      }
      return monthYear;
    } catch (error) {
      return monthYear;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Sistema de Notas Fiscais
              </h1>
              <p className="text-muted-foreground">
                Gerencie e acompanhe suas NFes eletrônicas
              </p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="nfes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="nfes">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Notas Fiscais
            </TabsTrigger>
            <TabsTrigger value="shops">
              <Store className="h-4 w-4 mr-2" />
              Lojas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nfes" className="space-y-6">
            <DashboardStats nfes={filteredNfes} />

            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-full max-w-xs space-y-2">
                  <Label htmlFor="shop-filter">Filtrar por Loja</Label>
                  <Select value={shopFilter} onValueChange={setShopFilter}>
                    <SelectTrigger id="shop-filter">
                      <SelectValue placeholder="Todas as Lojas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Lojas</SelectItem>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full max-w-xs space-y-2">
                  <Label htmlFor="month-filter">Filtrar por Mês/Ano</Label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger id="month-filter">
                  <SelectValue placeholder="Todos os Meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Meses</SelectItem>
                  {uniqueMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonthForDisplay(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full max-w-xs space-y-2">
              <Label htmlFor="status-filter">Filtrar por Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="complete">Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
                {((shopFilter && shopFilter !== "all") || (monthFilter && monthFilter !== "all") || (statusFilter && statusFilter !== "all")) && (
                  <button
                    onClick={() => {
                      setShopFilter("all");
                      setMonthFilter("all");
                      setStatusFilter("all");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                <NFeList nfes={filteredNfes} onUpdate={fetchNFes} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="shops">
            <ShopsManagement onShopsChange={fetchShops} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky FAB Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Notas Fiscais</DialogTitle>
          </DialogHeader>
          <NFeForm onSuccess={fetchNFes} onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
