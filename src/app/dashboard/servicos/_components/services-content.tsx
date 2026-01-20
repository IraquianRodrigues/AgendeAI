"use client";

import { useServices } from "@/services/services/use-services";
import { Card } from "@/components/ui/card";
import { ServicesTable } from "./services-table";
import { DollarSign, Package, TrendingUp, Award } from "lucide-react";
import { useMemo } from "react";

export default function ServicesContent() {
  const { data: services = [], isLoading, error } = useServices();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalServices = services.length;
    const totalRevenue = services.reduce((sum, s) => sum + (s.price || 0), 0);
    const avgPrice = totalServices > 0 ? totalRevenue / totalServices : 0;
    const mostExpensive = services.reduce((max, s) => 
      (s.price || 0) > (max.price || 0) ? s : max
    , services[0] || { price: 0 });

    return {
      totalServices,
      avgPrice,
      totalRevenue,
      mostExpensive,
    };
  }, [services]);

  return (
    <div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Serviços</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie os serviços cadastrados
          </p>
        </div>

        {/* Statistics Dashboard */}
        {!isLoading && !error && services.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Services */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Total de Serviços
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.totalServices}
                  </p>
                </div>
              </div>
            </Card>

            {/* Average Price */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Preço Médio
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      minimumFractionDigits: 0 
                    }).format(stats.avgPrice)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total Revenue Potential */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      minimumFractionDigits: 0 
                    }).format(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Most Expensive */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <Award className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Mais Caro
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.mostExpensive?.price ? new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      minimumFractionDigits: 0 
                    }).format(stats.mostExpensive.price) : '-'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {error ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-destructive">
                Erro ao carregar serviços. Por favor, tente novamente.
              </p>
            </div>
          </Card>
        ) : (
          <ServicesTable services={services} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}

