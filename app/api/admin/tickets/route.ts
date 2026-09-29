import { requireAdmin } from "@/lib/admin/require-admin";
import {
  connectDb,
  Business,
  SupportTicket,
  type SupportTicketLean,
  type TicketStatus,
} from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

const VALID_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(["support", "superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.trim();
    const validStatus = VALID_STATUSES.find((s) => s === status);

    await connectDb();
    const filter = validStatus ? { status: validStatus } : {};
    const tickets = await SupportTicket.find(filter)
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean<SupportTicketLean[]>();

    const businessIds = [...new Set(tickets.map((t) => String(t.businessId)))];
    const businesses = await Business.find({ _id: { $in: businessIds } })
      .select("businessName")
      .lean();
    const nameById = new Map(businesses.map((b) => [String(b._id), b.businessName]));

    return jsonOk({
      tickets: tickets.map((t) => ({
        id: String(t._id),
        businessName: nameById.get(String(t.businessId)) ?? "Unknown store",
        subject: t.subject,
        status: t.status,
        messageCount: t.messages.length,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (err) {
    console.error("[admin/tickets GET]", err);
    return jsonError("Could not load tickets.", 500);
  }
}
