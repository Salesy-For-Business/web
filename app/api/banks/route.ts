import { NextResponse } from "next/server";
import { fetchSupportedBanks } from "@/lib/banks-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") || "NG";
  const banks = await fetchSupportedBanks(country);
  return NextResponse.json({ banks });
}
