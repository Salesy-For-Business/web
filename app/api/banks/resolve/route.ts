import { NextResponse } from "next/server";
import { resolveBankAccount } from "@/lib/banks-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountNumber = searchParams.get("accountNumber") ?? "";
  const bankCode = searchParams.get("bankCode") ?? "";

  const result = await resolveBankAccount(accountNumber, bankCode);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    accountNumber: accountNumber.replace(/\D/g, ""),
    bankCode,
    accountName: result.accountName,
  });
}
