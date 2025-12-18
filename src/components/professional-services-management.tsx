"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Save, Trash2, Clock } from "lucide-react";
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
    <Card>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Serviços do Profissional</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gerencie quais serviços {professional.name} pode realizar e defina
              a duração específica para cada um
            </p>
          </div>

          <Separator />

          {allServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum serviço cadastrado no sistema
            </div>
          ) : (
            <div className="space-y-3">
              {allServices.map((service) => {
                const state = serviceStates.get(service.id);
                if (!state) return null;

                return (
                  <div
                    key={service.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="font-medium font-mono text-sm sm:text-base break-all">
                          {service.code}
                        </span>
                        {state.isActive ? (
                          <Badge variant="default" className="text-xs">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Inativo</Badge>
                        )}
                      </div>

                      {state.isActive && (
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          {state.isEditing ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                              <Input
                                type="number"
                                min="1"
                                value={state.customDuration}
                                onChange={(e) =>
                                  handleDurationChange(
                                    service.id,
                                    e.target.value
                                  )
                                }
                                className="w-20 sm:w-24 h-7 sm:h-8 text-sm"
                                disabled={isPending}
                              />
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                minutos
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleUpdateDuration(
                                    service.id,
                                    state.customDuration
                                  )
                                }
                                disabled={isPending}
                                className="h-7 sm:h-8"
                              >
                                <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs sm:text-sm">
                                {state.customDuration} minutos
                              </span>
                              {state.customDuration !==
                                state.defaultDuration && (
                                <span className="text-xs text-muted-foreground">
                                  (padrão: {state.defaultDuration}min)
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleEditing(service.id)}
                                disabled={isPending}
                                className="h-7 sm:h-8 text-xs sm:text-sm"
                              >
                                Editar
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant={state.isActive ? "outline" : "default"}
                        onClick={() => handleToggleService(service.id)}
                        disabled={isPending}
                        className="gap-2 text-xs sm:text-sm h-7 sm:h-8"
                      >
                        {state.isActive ? (
                          <span className="hidden sm:inline">Desativar</span>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Adicionar</span>
                          </>
                        )}
                      </Button>

                      {state.associationId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteService(service.id)}
                          disabled={isPending}
                          className="h-7 sm:h-8"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

