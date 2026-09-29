import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, Business, SupportTicket, type SupportTicketLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import {
  replyTicketSchema,
  updateTicketStatusSchema,
} from "@/lib/support-ticket-schemas";

async function toPublic(t: SupportTicketLean) {
  const business = await Business.findById(t.businessId).select("businessName").lean();
  return {
    id: String(t._id),
    businessName: business?.businessName ?? "Unknown store",
    subject: t.subject,
    status: t.status,
    messages: t.messages,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["support", "superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    await connectDb();
    const ticket = await SupportTicket.findById(id).lean<SupportTicketLean | null>();
    if (!ticket) return jsonError("Ticket not found.", 404);

    return jsonOk({ ticket: await toPublic(ticket) });
  } catch (err) {
    console.error("[admin/tickets/:id GET]", err);
    return jsonError("Could not load ticket.", 500);
  }
}

/** Appends an admin reply — reopens a resolved/closed ticket into
 * in_progress, same as the seller-reply behavior on the other side. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["support", "superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = replyTicketSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid message");
    }

    await connectDb();
    const ticket = await SupportTicket.findById(id);
    if (!ticket) return jsonError("Ticket not found.", 404);

    ticket.messages.push({
      authorType: "admin",
      authorName: "Salesy Support",
      body: parsed.data.message,
      createdAt: new Date(),
    });
    if (ticket.status === "open") ticket.status = "in_progress";
    await ticket.save();

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "ticket.reply",
      targetType: "ticket",
      targetId: id,
    });

    return jsonOk({ ticket: await toPublic(ticket.toObject()) });
  } catch (err) {
    console.error("[admin/tickets/:id POST]", err);
    return jsonError("Could not send reply.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["support", "superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTicketStatusSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid status");
    }

    await connectDb();
    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { status: parsed.data.status },
      { new: true },
    ).lean<SupportTicketLean | null>();
    if (!ticket) return jsonError("Ticket not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "ticket.status_change",
      targetType: "ticket",
      targetId: id,
      metadata: { status: parsed.data.status },
    });

    return jsonOk({ ticket: await toPublic(ticket) });
  } catch (err) {
    console.error("[admin/tickets/:id PATCH]", err);
    return jsonError("Could not update ticket.", 500);
  }
}
