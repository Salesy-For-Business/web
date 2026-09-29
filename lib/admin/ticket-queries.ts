"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketAuthorType = "business" | "admin";

export type AdminTicketRow = {
  id: string;
  businessName: string;
  subject: string;
  status: TicketStatus;
  messageCount: number;
  updatedAt: string;
};

export type TicketMessage = {
  authorType: TicketAuthorType;
  authorName: string;
  body: string;
  createdAt: string;
};

export type AdminTicketDetail = {
  id: string;
  businessName: string;
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
};

export function useAdminTicketsQuery(status: string) {
  return useQuery({
    queryKey: ["admin", "tickets", "list", status],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ tickets: AdminTicketRow[] }>>(
        "/admin/tickets",
        { params: status ? { status } : undefined },
      );
      return data.tickets;
    },
  });
}

export function useAdminTicketQuery(id: string) {
  return useQuery({
    queryKey: ["admin", "tickets", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ ticket: AdminTicketDetail }>>(
        `/admin/tickets/${id}`,
      );
      return data.ticket;
    },
  });
}

export function useAdminReplyTicketMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post<ApiOk<{ ticket: AdminTicketDetail }>>(
        `/admin/tickets/${id}`,
        { message },
      );
      return data.ticket;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
  });
}

export function useAdminUpdateTicketStatusMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: TicketStatus) => {
      const { data } = await api.patch<ApiOk<{ ticket: AdminTicketDetail }>>(
        `/admin/tickets/${id}`,
        { status },
      );
      return data.ticket;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
  });
}

export { getApiError };
