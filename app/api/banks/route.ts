import { NextResponse } from "next/server";
import { fetchSupportedBanks } from "@/lib/banks-api";

export async function GET() {
  const banks = await fetchSupportedBanks();
  return NextResponse.json({ banks });
}
