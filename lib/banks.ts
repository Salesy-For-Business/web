/** Supported Nigerian banks for payouts (demo + API-shaped). */

export type Bank = {
  code: string;
  name: string;
};

/** Curated fallback list when the external banks API is unavailable. */
export const DEMO_BANKS: Bank[] = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank For Africa" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "999", name: "OPay" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "120001", name: "9mobile 9Payment Service Bank" },
].sort((a, b) => a.name.localeCompare(b.name));

/** Demo NUBAN → account name pairs (account number is enough for demo resolve). */
const DEMO_RESOLUTIONS: Record<string, string> = {
  "0123456789": "CHIDI OKAFOR",
  "2212345678": "ADEOLA BALOGUN",
  "3001234567": "FUNKE ADEYEMI",
  "2087654321": "IBRAHIM MUSA",
  "0111111111": "NGOZI EZE",
};

/**
 * Deterministic demo resolve for any 10-digit NUBAN.
 * Known demos use fixed names; others get a stable placeholder name.
 */
export function demoResolveAccount(
  accountNumber: string,
  bankCode: string,
): { accountName: string } | { error: string } {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length !== 10) {
    return { error: "Account number must be 10 digits." };
  }
  if (!bankCode) {
    return { error: "Select a bank." };
  }
  const bank = DEMO_BANKS.find((b) => b.code === bankCode);
  if (!bank) {
    return { error: "That bank is not supported for payouts." };
  }

  const known = DEMO_RESOLUTIONS[digits];
  if (known) {
    return { accountName: known };
  }

  // Fail a few “invalid” accounts for a realistic security check.
  if (digits.startsWith("0000") || digits === "1234567890") {
    return { error: "Could not resolve this account. Check the number and bank." };
  }

  const names = [
    "CHIEMEKA NWOSU",
    "FATIMA ABDULLAHI",
    "TEMITOPE ADEYINKA",
    "KELECHI OBI",
    "AMINA BELLO",
  ];
  const idx =
    (Number(digits.slice(-2)) + Number(bankCode.replace(/\D/g, "") || 0)) %
    names.length;
  return { accountName: names[idx]! };
}

export function isValidNuban(value: string) {
  return /^\d{10}$/.test(value.replace(/\D/g, ""));
}
