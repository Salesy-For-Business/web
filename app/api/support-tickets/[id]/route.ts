import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { connectDb, SupportTicket, type SupportTicketLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { replyTicketSchema } from "@/lib/support-ticket-schemas";

function toPublic(t: SupportTicketLean) {
  return {
    id: String(t._id),
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
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const { id } = await params;
    await connectDb();
    const ticket = await SupportTicket.findOne({
      _id: id,
      businessId: owned.business._id,
    }).lean<SupportTicketLean | null>();
    if (!ticket) return jsonError("Ticket not found.", 404);

    return jsonOk({ ticket: toPublic(ticket) });
  } catch (err) {
    console.error("[support-tickets/:id GET]", err);
    return jsonError("Could not load ticket.", 500);
  }
}

/** A seller replying re-opens a resolved/closed ticket. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = replyTicketSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid message");
    }

    await connectDb();
    const ticket = await SupportTicket.findOne({
      _id: id,
      businessId: owned.business._id,
    });
    if (!ticket) return jsonError("Ticket not found.", 404);

    ticket.messages.push({
      authorType: "business",
      authorName: owned.business.businessName,
      body: parsed.data.message,
      createdAt: new Date(),
    });
    if (ticket.status === "resolved" || ticket.status === "closed") {
      ticket.status = "open";
    }
    await ticket.save();

    return jsonOk({ ticket: toPublic(ticket.toObject()) });
  } catch (err) {
    console.error("[support-tickets/:id POST]", err);
    return jsonError("Could not send reply.", 500);
  }
}
