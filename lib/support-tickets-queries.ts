"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketMessage = {
  authorType: "business" | "admin";
  authorName: string;
  body: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
};

export const supportTicketKeys = {
  all: ["support-tickets"] as const,
  detail: (id: string) => ["support-tickets", id] as const,
};

export function useSupportTicketsQuery() {
  return useQuery({
    queryKey: supportTicketKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ tickets: SupportTicket[] }>>(
        "/support-tickets",
      );
      return data.tickets;
    },
  });
}

export function useSupportTicketQuery(id: string) {
  return useQuery({
    queryKey: supportTicketKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ ticket: SupportTicket }>>(
        `/support-tickets/${id}`,
      );
      return data.ticket;
    },
    enabled: Boolean(id),
  });
}

export function useCreateSupportTicketMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subject: string; message: string }) => {
      const { data } = await api.post<ApiOk<{ ticket: SupportTicket }>>(
        "/support-tickets",
        input,
      );
      return data.ticket;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: supportTicketKeys.all });
    },
  });
}

export function useReplySupportTicketMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post<ApiOk<{ ticket: SupportTicket }>>(
        `/support-tickets/${id}`,
        { message },
      );
      return data.ticket;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: supportTicketKeys.all });
      await qc.invalidateQueries({ queryKey: supportTicketKeys.detail(id) });
    },
  });
}

export { getApiError };
