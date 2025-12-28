"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Save, Trash2, Clock, Search, Edit2 } from "lucide-react";
import type { ProfessionalRow, ServiceRow } from "@/types/database.types";
import { toast } from "sonner";
import { useServices } from "@/services/services/use-services";
import {
  useServicesByProfessional,
  useCreateProfessionalService,
  useUpdateProfessionalService,
  useDeleteProfessionalService,
} from "@/services/professional-services/use-professional-services";

interface ProfessionalServicesManagementProps {
  professional: ProfessionalRow;
}

interface ServiceState {
  serviceId: number;
  associationId: number | null;
  isActive: boolean;
  customDuration: number;
  defaultDuration: number;
  isEditing: boolean;
}

export function ProfessionalServicesManagement({
  professional,
}: ProfessionalServicesManagementProps) {
  const [serviceStates, setServiceStates] = useState<
    Map<number, ServiceState>
  >(new Map());

  const { data: allServices = [], isLoading: isLoadingServices } =
    useServices();
  const {
    data: professionalServices = [],
    isLoading: isLoadingProfessionalServices,
  } = useServicesByProfessional(professional.id);

  const createMutation = useCreateProfessionalService();
  const updateMutation = useUpdateProfessionalService();
  const deleteMutation = useDeleteProfessionalService();

  // Chave de comparação estável
  const servicesKey = useMemo(
    () =>
      allServices
        .map((s) => s.id)
        .sort()
        .join(","),
    [allServices]
  );
  const associationsKey = useMemo(
    () =>
      professionalServices
        .map((ps) => `${ps.service_id}:${ps.id}:${ps.custom_duration_minutes}:${ps.is_active}`)
        .sort()
        .join(","),
    [professionalServices]
  );

  const previousKeyRef = useRef<string>("");

  // Inicializa os estados dos serviços apenas quando os dados mudarem
  useEffect(() => {
    const currentKey = `${servicesKey}|${associationsKey}`;

    // Só atualiza se a chave mudou
    if (currentKey === previousKeyRef.current) {
      return;
    }

    previousKeyRef.current = currentKey;

    // Só atualiza se temos serviços carregados
    if (allServices.length === 0) {
      setServiceStates(new Map());
      return;
    }

    const newStates = new Map<number, ServiceState>();
    const associationMap = new Map<number, typeof professionalServices[0]>();
    professionalServices.forEach((ps) => {
      associationMap.set(ps.service_id, ps);
    });

    allServices.forEach((service) => {
      const association = associationMap.get(service.id);

      newStates.set(service.id, {
        serviceId: service.id,
        associationId: association?.id || null,
        isActive: association?.is_active || false,
        customDuration:
          association?.custom_duration_minutes || service.duration_minutes,
        defaultDuration: service.duration_minutes,
        isEditing: false,
      });
    });

    setServiceStates(newStates);
  }, [servicesKey, associationsKey, allServices, professionalServices]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleToggleService = async (serviceId: number) => {
    const state = serviceStates.get(serviceId);
    if (!state) return;

    try {
      if (state.associationId) {
        // Atualizar associação existente
        await updateMutation.mutateAsync({
          id: state.associationId,
          is_active: !state.isActive,
        });

        toast.success(
          state.isActive
            ? "Serviço desativado com sucesso"
            : "Serviço ativado com sucesso"
        );
      } else {
        // Criar nova associação
        await createMutation.mutateAsync({
          professional_id: professional.id,
          service_id: serviceId,
          custom_duration_minutes: state.customDuration,
          is_active: true,
        });

        toast.success("Serviço adicionado com sucesso");
      }
    } catch (error) {
      toast.error("Erro ao atualizar serviço");
    }
  };

  const handleUpdateDuration = async (serviceId: number, duration: number) => {
    const state = serviceStates.get(serviceId);
    if (!state || !state.associationId) return;

    if (duration <= 0) {
      toast.error("Duração deve ser maior que zero");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: state.associationId,
        custom_duration_minutes: duration,
      });

      toast.success("Duração atualizada com sucesso");

      // Desabilita edição
      setServiceStates((prev) => {
        const newStates = new Map(prev);
        const current = newStates.get(serviceId);
        if (current) {
          newStates.set(serviceId, { ...current, isEditing: false });
        }
        return newStates;
      });
    } catch (error) {
      toast.error("Erro ao atualizar duração");
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    const state = serviceStates.get(serviceId);
    if (!state || !state.associationId) return;

    try {
      await deleteMutation.mutateAsync(state.associationId);
      toast.success("Associação removida com sucesso");
    } catch (error) {
      toast.error("Erro ao remover associação");
    }
  };

  const handleDurationChange = (serviceId: number, value: string) => {
    const duration = parseInt(value);
    if (isNaN(duration)) return;

    setServiceStates((prev) => {
      const newStates = new Map(prev);
      const current = newStates.get(serviceId);
      if (current) {
        newStates.set(serviceId, { ...current, customDuration: duration });
      }
      return newStates;
    });
  };

  const toggleEditing = (serviceId: number) => {
    setServiceStates((prev) => {
      const newStates = new Map(prev);
      const current = newStates.get(serviceId);
      if (current) {
        newStates.set(serviceId, {
          ...current,
          isEditing: !current.isEditing,
        });
      }
      return newStates;
    });
  };

  const filteredServices = allServices.filter((service) =>
    service.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = isLoadingServices || isLoadingProfessionalServices;
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando serviços...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-50/50 dark:bg-slate-900/20">
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-950"
            />
          </div>
        </div>

        <Separator />

        {filteredServices.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-white/50 dark:bg-slate-950/50">
            <p className="text-muted-foreground text-sm">
              {searchTerm
                ? "Nenhum serviço encontrado para sua busca"
                : "Nenhum serviço disponível"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredServices.map((service) => {
              const state = serviceStates.get(service.id);
              if (!state) return null;

              const isAssigned = state.isActive;

              return (
                <div
                  key={service.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                    ${isAssigned
                      ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-slate-950 border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                    }
                  `}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex flex-col">
                      <span className={`font-medium text-sm ${isAssigned ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"}`}>
                        {service.code}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {isAssigned ? (
                          state.isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={state.customDuration}
                                onChange={(e) =>
                                  handleDurationChange(service.id, e.target.value)
                                }
                                className="w-16 h-6 text-xs px-1.5 py-0 bg-white"
                                autoFocus
                                onBlur={() => handleUpdateDuration(service.id, state.customDuration)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleUpdateDuration(service.id, state.customDuration);
                                }}
                              />
                              <span className="text-[10px] text-slate-500">min</span>
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 px-1.5 py-0.5 rounded transition-colors"
                              onClick={() => toggleEditing(service.id)}
                              title="Clique para editar o tempo"
                            >
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {state.customDuration} min
                              </span>
                              {state.customDuration !== state.defaultDuration && (
                                <span className="text-[10px] text-slate-400">(padrão: {state.defaultDuration})</span>
                              )}
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-50" />
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">
                            {state.defaultDuration} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAssigned ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleService(service.id)}
                        disabled={isPending}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleService(service.id)}
                        disabled={isPending}
                        className="h-8 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      >
                        Adicionar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

