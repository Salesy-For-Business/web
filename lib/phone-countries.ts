export type PhoneCountry = {
  /** ISO 3166-1 alpha-2 — used as the option's unique key (some countries
   * share a dial code, e.g. US/Canada both use "1"). */
  iso2: string;
  name: string;
  /** Calling code, no "+" prefix. */
  dialCode: string;
  /** Illustrative local-number example in that country's common grouping
   * (no dial code) — shown as the input's placeholder. Hand-curated, not
   * sourced from phone-number metadata (nothing like libphonenumber-js is
   * wired in), so treat these as "looks right," not validated formats. */
  example: string;
};

/**
 * Curated calling-code list: every African country (this platform's home
 * market) plus a broad set of the rest of the world, so sign-up isn't
 * Nigeria-only. Not the full ITU/UN territory list, but easy to extend —
 * add a row here and it shows up everywhere this file is used.
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  // --- Africa ---
  { iso2: "NG", name: "Nigeria", dialCode: "234", example: "801 234 5678" },
  { iso2: "DZ", name: "Algeria", dialCode: "213", example: "551 23 45 67" },
  { iso2: "AO", name: "Angola", dialCode: "244", example: "923 456 789" },
  { iso2: "BJ", name: "Benin", dialCode: "229", example: "90 01 23 45" },
  { iso2: "BW", name: "Botswana", dialCode: "267", example: "71 234 567" },
  { iso2: "BF", name: "Burkina Faso", dialCode: "226", example: "70 12 34 56" },
  { iso2: "BI", name: "Burundi", dialCode: "257", example: "79 56 12 34" },
  { iso2: "CV", name: "Cabo Verde", dialCode: "238", example: "991 23 45" },
  { iso2: "CM", name: "Cameroon", dialCode: "237", example: "671 23 45 67" },
  {
    iso2: "CF",
    name: "Central African Republic",
    dialCode: "236",
    example: "70 01 23 45",
  },
  { iso2: "TD", name: "Chad", dialCode: "235", example: "63 01 23 45" },
  { iso2: "KM", name: "Comoros", dialCode: "269", example: "321 23 45" },
  { iso2: "CG", name: "Congo-Brazzaville", dialCode: "242", example: "06 123 4567" },
  { iso2: "CD", name: "Congo (DRC)", dialCode: "243", example: "991 234 567" },
  { iso2: "CI", name: "Côte d’Ivoire", dialCode: "225", example: "01 23 45 67 89" },
  { iso2: "DJ", name: "Djibouti", dialCode: "253", example: "77 83 10 01" },
  { iso2: "EG", name: "Egypt", dialCode: "20", example: "100 123 4567" },
  {
    iso2: "GQ",
    name: "Equatorial Guinea",
    dialCode: "240",
    example: "222 123 456",
  },
  { iso2: "ER", name: "Eritrea", dialCode: "291", example: "7 123 456" },
  { iso2: "SZ", name: "Eswatini", dialCode: "268", example: "7612 3456" },
  { iso2: "ET", name: "Ethiopia", dialCode: "251", example: "91 123 4567" },
  { iso2: "GA", name: "Gabon", dialCode: "241", example: "06 03 12 34" },
  { iso2: "GM", name: "Gambia", dialCode: "220", example: "301 2345" },
  { iso2: "GH", name: "Ghana", dialCode: "233", example: "24 123 4567" },
  { iso2: "GN", name: "Guinea", dialCode: "224", example: "601 23 45 67" },
  {
    iso2: "GW",
    name: "Guinea-Bissau",
    dialCode: "245",
    example: "955 012 345",
  },
  { iso2: "KE", name: "Kenya", dialCode: "254", example: "712 345 678" },
  { iso2: "LS", name: "Lesotho", dialCode: "266", example: "5012 3456" },
  { iso2: "LR", name: "Liberia", dialCode: "231", example: "770 123 456" },
  { iso2: "LY", name: "Libya", dialCode: "218", example: "91 234 5678" },
  { iso2: "MG", name: "Madagascar", dialCode: "261", example: "32 12 345 67" },
  { iso2: "MW", name: "Malawi", dialCode: "265", example: "991 23 45 67" },
  { iso2: "ML", name: "Mali", dialCode: "223", example: "65 01 23 45" },
  { iso2: "MR", name: "Mauritania", dialCode: "222", example: "22 12 34 56" },
  { iso2: "MU", name: "Mauritius", dialCode: "230", example: "5251 2345" },
  { iso2: "MA", name: "Morocco", dialCode: "212", example: "612 345 678" },
  { iso2: "MZ", name: "Mozambique", dialCode: "258", example: "82 123 4567" },
  { iso2: "NA", name: "Namibia", dialCode: "264", example: "81 123 4567" },
  { iso2: "NE", name: "Niger", dialCode: "227", example: "93 12 34 56" },
  { iso2: "RW", name: "Rwanda", dialCode: "250", example: "720 123 456" },
  {
    iso2: "ST",
    name: "São Tomé and Príncipe",
    dialCode: "239",
    example: "981 2345",
  },
  { iso2: "SN", name: "Senegal", dialCode: "221", example: "70 123 45 67" },
  { iso2: "SC", name: "Seychelles", dialCode: "248", example: "2 510 123" },
  { iso2: "SL", name: "Sierra Leone", dialCode: "232", example: "25 123 456" },
  { iso2: "SO", name: "Somalia", dialCode: "252", example: "61 234 5678" },
  { iso2: "ZA", name: "South Africa", dialCode: "27", example: "71 234 5678" },
  { iso2: "SS", name: "South Sudan", dialCode: "211", example: "91 123 4567" },
  { iso2: "SD", name: "Sudan", dialCode: "249", example: "91 123 4567" },
  { iso2: "TZ", name: "Tanzania", dialCode: "255", example: "621 234 567" },
  { iso2: "TG", name: "Togo", dialCode: "228", example: "90 12 34 56" },
  { iso2: "TN", name: "Tunisia", dialCode: "216", example: "20 123 456" },
  { iso2: "UG", name: "Uganda", dialCode: "256", example: "712 345 678" },
  { iso2: "ZM", name: "Zambia", dialCode: "260", example: "955 123 456" },
  { iso2: "ZW", name: "Zimbabwe", dialCode: "263", example: "71 234 5678" },

  // --- Rest of the world ---
  { iso2: "US", name: "United States", dialCode: "1", example: "(555) 234 1234" },
  { iso2: "CA", name: "Canada", dialCode: "1", example: "(555) 234 1234" },
  { iso2: "GB", name: "United Kingdom", dialCode: "44", example: "7911 123456" },
  { iso2: "IE", name: "Ireland", dialCode: "353", example: "85 123 4567" },
  { iso2: "FR", name: "France", dialCode: "33", example: "6 12 34 56 78" },
  { iso2: "DE", name: "Germany", dialCode: "49", example: "151 2345 6789" },
  { iso2: "ES", name: "Spain", dialCode: "34", example: "612 34 56 78" },
  { iso2: "PT", name: "Portugal", dialCode: "351", example: "912 345 678" },
  { iso2: "IT", name: "Italy", dialCode: "39", example: "312 345 6789" },
  { iso2: "NL", name: "Netherlands", dialCode: "31", example: "6 1234 5678" },
  { iso2: "BE", name: "Belgium", dialCode: "32", example: "470 12 34 56" },
  { iso2: "CH", name: "Switzerland", dialCode: "41", example: "78 123 45 67" },
  { iso2: "AT", name: "Austria", dialCode: "43", example: "664 123 456" },
  { iso2: "SE", name: "Sweden", dialCode: "46", example: "70 123 45 67" },
  { iso2: "NO", name: "Norway", dialCode: "47", example: "406 12 345" },
  { iso2: "DK", name: "Denmark", dialCode: "45", example: "20 12 34 56" },
  { iso2: "FI", name: "Finland", dialCode: "358", example: "41 234 5678" },
  { iso2: "IS", name: "Iceland", dialCode: "354", example: "611 2345" },
  { iso2: "PL", name: "Poland", dialCode: "48", example: "512 345 678" },
  { iso2: "CZ", name: "Czechia", dialCode: "420", example: "601 123 456" },
  { iso2: "SK", name: "Slovakia", dialCode: "421", example: "912 123 456" },
  { iso2: "HU", name: "Hungary", dialCode: "36", example: "20 123 4567" },
  { iso2: "RO", name: "Romania", dialCode: "40", example: "712 345 678" },
  { iso2: "BG", name: "Bulgaria", dialCode: "359", example: "87 123 4567" },
  { iso2: "GR", name: "Greece", dialCode: "30", example: "691 234 5678" },
  { iso2: "TR", name: "Türkiye", dialCode: "90", example: "501 234 56 78" },
  { iso2: "RU", name: "Russia", dialCode: "7", example: "912 345 67 89" },
  { iso2: "UA", name: "Ukraine", dialCode: "380", example: "50 123 4567" },
  { iso2: "BY", name: "Belarus", dialCode: "375", example: "29 123 45 67" },
  { iso2: "LT", name: "Lithuania", dialCode: "370", example: "612 34567" },
  { iso2: "LV", name: "Latvia", dialCode: "371", example: "21 234 567" },
  { iso2: "EE", name: "Estonia", dialCode: "372", example: "512 3456" },
  { iso2: "MD", name: "Moldova", dialCode: "373", example: "621 23 456" },
  { iso2: "HR", name: "Croatia", dialCode: "385", example: "91 234 5678" },
  { iso2: "SI", name: "Slovenia", dialCode: "386", example: "31 234 567" },
  { iso2: "RS", name: "Serbia", dialCode: "381", example: "60 123 4567" },
  {
    iso2: "BA",
    name: "Bosnia and Herzegovina",
    dialCode: "387",
    example: "61 123 456",
  },
  { iso2: "ME", name: "Montenegro", dialCode: "382", example: "67 622 901" },
  { iso2: "MK", name: "North Macedonia", dialCode: "389", example: "70 123 456" },
  { iso2: "AL", name: "Albania", dialCode: "355", example: "66 123 4567" },
  { iso2: "XK", name: "Kosovo", dialCode: "383", example: "44 123 456" },
  { iso2: "LU", name: "Luxembourg", dialCode: "352", example: "621 123 456" },
  { iso2: "MT", name: "Malta", dialCode: "356", example: "9912 3456" },
  { iso2: "CY", name: "Cyprus", dialCode: "357", example: "96 123456" },
  { iso2: "IN", name: "India", dialCode: "91", example: "81234 56789" },
  { iso2: "PK", name: "Pakistan", dialCode: "92", example: "301 2345678" },
  { iso2: "BD", name: "Bangladesh", dialCode: "880", example: "1812 345678" },
  { iso2: "LK", name: "Sri Lanka", dialCode: "94", example: "71 234 5678" },
  { iso2: "NP", name: "Nepal", dialCode: "977", example: "984 123 4567" },
  { iso2: "CN", name: "China", dialCode: "86", example: "138 0013 8000" },
  { iso2: "JP", name: "Japan", dialCode: "81", example: "90 1234 5678" },
  { iso2: "KR", name: "South Korea", dialCode: "82", example: "10 1234 5678" },
  { iso2: "VN", name: "Vietnam", dialCode: "84", example: "91 234 56 78" },
  { iso2: "TH", name: "Thailand", dialCode: "66", example: "81 234 5678" },
  { iso2: "PH", name: "Philippines", dialCode: "63", example: "917 123 4567" },
  { iso2: "ID", name: "Indonesia", dialCode: "62", example: "812 3456 789" },
  { iso2: "MY", name: "Malaysia", dialCode: "60", example: "12 345 6789" },
  { iso2: "SG", name: "Singapore", dialCode: "65", example: "8123 4567" },
  { iso2: "MM", name: "Myanmar", dialCode: "95", example: "9 123 456 789" },
  { iso2: "KH", name: "Cambodia", dialCode: "855", example: "91 234 567" },
  { iso2: "LA", name: "Laos", dialCode: "856", example: "20 2345 6789" },
  { iso2: "MN", name: "Mongolia", dialCode: "976", example: "8812 3456" },
  { iso2: "TW", name: "Taiwan", dialCode: "886", example: "912 345 678" },
  { iso2: "HK", name: "Hong Kong", dialCode: "852", example: "5123 4567" },
  { iso2: "AU", name: "Australia", dialCode: "61", example: "412 345 678" },
  { iso2: "NZ", name: "New Zealand", dialCode: "64", example: "21 123 4567" },
  { iso2: "FJ", name: "Fiji", dialCode: "679", example: "701 2345" },
  {
    iso2: "AE",
    name: "United Arab Emirates",
    dialCode: "971",
    example: "50 123 4567",
  },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "966", example: "50 123 4567" },
  { iso2: "QA", name: "Qatar", dialCode: "974", example: "3312 3456" },
  { iso2: "KW", name: "Kuwait", dialCode: "965", example: "500 12345" },
  { iso2: "BH", name: "Bahrain", dialCode: "973", example: "3600 1234" },
  { iso2: "OM", name: "Oman", dialCode: "968", example: "9212 3456" },
  { iso2: "YE", name: "Yemen", dialCode: "967", example: "712 345 678" },
  { iso2: "JO", name: "Jordan", dialCode: "962", example: "79 012 3456" },
  { iso2: "LB", name: "Lebanon", dialCode: "961", example: "71 123 456" },
  { iso2: "IL", name: "Israel", dialCode: "972", example: "50 123 4567" },
  { iso2: "PS", name: "Palestine", dialCode: "970", example: "599 123 456" },
  { iso2: "IQ", name: "Iraq", dialCode: "964", example: "790 123 4567" },
  { iso2: "IR", name: "Iran", dialCode: "98", example: "912 345 6789" },
  { iso2: "AF", name: "Afghanistan", dialCode: "93", example: "70 123 4567" },
  { iso2: "KZ", name: "Kazakhstan", dialCode: "7", example: "701 234 5678" },
  { iso2: "UZ", name: "Uzbekistan", dialCode: "998", example: "91 234 56 78" },
  { iso2: "AZ", name: "Azerbaijan", dialCode: "994", example: "40 123 45 67" },
  { iso2: "AM", name: "Armenia", dialCode: "374", example: "77 123 456" },
  { iso2: "GE", name: "Georgia", dialCode: "995", example: "555 12 34 56" },
  { iso2: "MX", name: "Mexico", dialCode: "52", example: "55 1234 5678" },
  { iso2: "BR", name: "Brazil", dialCode: "55", example: "11 91234 5678" },
  { iso2: "AR", name: "Argentina", dialCode: "54", example: "11 2345 6789" },
  { iso2: "CL", name: "Chile", dialCode: "56", example: "9 6123 4567" },
  { iso2: "CO", name: "Colombia", dialCode: "57", example: "300 123 4567" },
  { iso2: "PE", name: "Peru", dialCode: "51", example: "912 345 678" },
  { iso2: "VE", name: "Venezuela", dialCode: "58", example: "412 123 4567" },
  { iso2: "EC", name: "Ecuador", dialCode: "593", example: "99 123 4567" },
  { iso2: "BO", name: "Bolivia", dialCode: "591", example: "712 34 567" },
  { iso2: "PY", name: "Paraguay", dialCode: "595", example: "961 234 567" },
  { iso2: "UY", name: "Uruguay", dialCode: "598", example: "94 123 456" },
  { iso2: "CU", name: "Cuba", dialCode: "53", example: "5 123 4567" },
  {
    iso2: "DO",
    name: "Dominican Republic",
    dialCode: "1",
    example: "(809) 234 5678",
  },
  { iso2: "JM", name: "Jamaica", dialCode: "1", example: "(876) 234 5678" },
  {
    iso2: "TT",
    name: "Trinidad and Tobago",
    dialCode: "1",
    example: "(868) 234 5678",
  },
  { iso2: "HT", name: "Haiti", dialCode: "509", example: "34 12 3456" },
  { iso2: "PA", name: "Panama", dialCode: "507", example: "6123 4567" },
  { iso2: "CR", name: "Costa Rica", dialCode: "506", example: "8312 3456" },
  { iso2: "NI", name: "Nicaragua", dialCode: "505", example: "8123 4567" },
  { iso2: "HN", name: "Honduras", dialCode: "504", example: "9123 4567" },
  { iso2: "SV", name: "El Salvador", dialCode: "503", example: "7012 3456" },
  { iso2: "GT", name: "Guatemala", dialCode: "502", example: "5123 4567" },
  { iso2: "BZ", name: "Belize", dialCode: "501", example: "622 1234" },
];

export const DEFAULT_PHONE_COUNTRY_ISO2 = "NG";

export function findPhoneCountry(iso2: string): PhoneCountry | undefined {
  return PHONE_COUNTRIES.find((c) => c.iso2 === iso2);
}

export function defaultPhoneCountry(): PhoneCountry {
  return findPhoneCountry(DEFAULT_PHONE_COUNTRY_ISO2) ?? PHONE_COUNTRIES[0];
}

/**
 * Best-guess country for an existing phone value (e.g. editing a saved
 * profile) — longest dial-code match wins, since some codes are prefixes of
 * others (e.g. "1" vs "27" vs "254").
 */
export function detectPhoneCountry(value: string | undefined | null) {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;

  let best: PhoneCountry | undefined;
  for (const country of PHONE_COUNTRIES) {
    if (
      digits.startsWith(country.dialCode) &&
      (!best || country.dialCode.length > best.dialCode.length)
    ) {
      best = country;
    }
  }
  return best;
}

/**
 * ISO 3166-1 alpha-2 → flag image path. Actual SVG assets, not the Unicode
 * flag emoji — Windows' default emoji font (Segoe UI Emoji) has no flag
 * glyphs, so Chrome/Edge/Firefox on Windows render the raw regional-
 * indicator letters ("NG") instead of a flag; that's a font gap on the OS,
 * not something any web page can fix by picking a different character.
 *
 * SVGs in `public/flags/` are copied from the `flag-icons` npm package
 * (MIT licensed — github.com/lipis/flag-icons). To add a country not
 * already covered, copy its `flags/4x3/<iso2>.svg` from that package into
 * `public/flags/`.
 */
export function flagSrc(iso2: string) {
  return `/flags/${iso2.toLowerCase()}.svg`;
}
