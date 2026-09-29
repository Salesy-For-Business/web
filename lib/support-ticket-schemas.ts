import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().trim().min(3, "Enter a subject").max(200),
  message: z.string().trim().min(1, "Enter a message").max(4000),
});

export const replyTicketSchema = z.object({
  message: z.string().trim().min(1, "Enter a message").max(4000),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});
