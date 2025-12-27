---
description: Roteiro para transformar o Sistema de Agendamentos em um CRM completo
---

# Roteiro de Transformação CRM

Este roteiro detalha os passos para evoluir o sistema atual para um CRM (Customer Relationship Management) focado em clínicas.

## Fase 1: Visão e Controle (O "Wow" Factor)
1. **Pipeline de Agendamentos (Kanban)**
   - Criar uma visualização de quadros (Kanban) para os agendamentos.
   - Colunas sugeridas: `Agendado`, `Confirmado`, `Em Sala`, `Finalizado`, `Cancelado`.
   - *Nota Técnica*: Necessário adicionar campo `status` na tabela `appointments` ou inferir via lógica incial.

2. **Dashboard de Métricas CRM**
   - Adicionar KPIs (Indicadores Chave):
     - Taxa de Ocupação da Agenda.
     - Ticket Médio por Paciente.
     - Novos Clientes vs Clientes Recorrentes.

## Fase 2: Gestão de Relacionamento (O Coração do CRM)
1. **Perfil do Cliente 360°**
   - Expandir o modal de detalhes do cliente.
   - Adicionar abas:
     - **Histórico**: Lista cronológica de todos os atendimentos passados.
     - **Financeiro**: Total investido pelo cliente na clínica.
     - **Anotações**: Campo de texto livre para observações (ex: "Gosta de ar condicionado fraco").
     - **Tags**: Etiquetas coloridas (Ex: `VIP`, `Indicação`, `Plano de Saúde`).

2. **Gestão de Leads (Pré-venda)**
   - Criar uma área para cadastrar interessados que ainda não agendaram.
   - Funil de conversão para transformar Leads em Clientes.

## Fase 3: Retenção e Inteligência
1. **Ferramenta de Reativação**
   - Filtro automático: "Clientes que não voltam há mais de 6 meses".
   - Botão de "Enviar WhatsApp" com mensagem padrão de convite.

2. **Alertas e Lembretes**
   - Lembretes de aniversário.
   - Lembretes de retorno preventivo.

---

## Próximos Passos Recomendados
Sugerimos começar pela **Fase 1 - Item 1 (Kanban)**, pois gera o maior impacto visual e operacional imediato.
