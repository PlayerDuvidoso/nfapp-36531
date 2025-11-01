import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, DollarSign, Package } from "lucide-react";

interface NFe {
  sent_to_accounting: boolean;
  is_paid: boolean;
  added_to_stock: boolean;
  value: number;
}

interface DashboardStatsProps {
  nfes: NFe[];
}

export const DashboardStats = ({ nfes }: DashboardStatsProps) => {
  const totalNFes = nfes.length;
  const sentToAccounting = nfes.filter((nfe) => nfe.sent_to_accounting).length;
  const paid = nfes.filter((nfe) => nfe.is_paid).length;
  const addedToStock = nfes.filter((nfe) => nfe.added_to_stock).length;
  const totalValue = nfes.reduce((sum, nfe) => sum + nfe.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const stats = [
    {
      title: "Total de NFes",
      value: totalNFes,
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Enviadas à Contabilidade",
      value: sentToAccounting,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      title: "Pagas",
      value: paid,
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Adicionadas ao Estoque",
      value: addedToStock,
      icon: Package,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(totalValue)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
