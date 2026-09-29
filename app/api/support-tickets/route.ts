import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { connectDb, SupportTicket, type SupportTicketLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createTicketSchema } from "@/lib/support-ticket-schemas";

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

export async function GET() {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    await connectDb();
    const tickets = await SupportTicket.find({ businessId: owned.business._id })
      .sort({ updatedAt: -1 })
      .lean<SupportTicketLean[]>();

    return jsonOk({ tickets: tickets.map(toPublic) });
  } catch (err) {
    console.error("[support-tickets GET]", err);
    return jsonError("Could not load tickets.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid ticket");
    }

    await connectDb();
    const ticket = await SupportTicket.create({
      businessId: owned.business._id,
      subject: parsed.data.subject,
      status: "open",
      messages: [
        {
          authorType: "business",
          authorName: owned.business.businessName,
          body: parsed.data.message,
          createdAt: new Date(),
        },
      ],
    });

    return jsonOk({ ticket: toPublic(ticket.toObject()) }, { status: 201 });
  } catch (err) {
    console.error("[support-tickets POST]", err);
    return jsonError("Could not create ticket.", 500);
  }
}
