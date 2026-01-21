import type { DonationInfo } from "../entities/DonationInfo";

export function hashData(data: DonationInfo): string {
  const values = Object.values(data).map((field: any) => {
    const val = field?.value;
    if (Array.isArray(val)) {      
      return val.map((v: any) => (typeof v === "string" ? v.trim() : String(v))).join(",");
    }
    if (typeof val === "string") {
      return val.trim();
    }
    if (val == null) {
      return "";
    }
    return String(val);
  });

  const str = values.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

export function formatDateToTurkish(dateString: string): string {
  if (!dateString) return "";

  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatPhoneNumber(value: string): string {
  let cleaned = value.replace(/\D/g, "");
  if (cleaned.length > 0 && !cleaned.startsWith("0")) {
    cleaned = "0" + cleaned;
  }
  cleaned = cleaned.substring(0, 11);

  let formatted = cleaned;
  if (cleaned.length > 4) {
    formatted = cleaned.substring(0, 4) + " " + cleaned.substring(4);
  }
  if (cleaned.length > 7) {
    formatted =
      cleaned.substring(0, 4) +
      " " +
      cleaned.substring(4, 7) +
      " " +
      cleaned.substring(7);
  }
  if (cleaned.length > 9) {
    formatted =
      cleaned.substring(0, 4) +
      " " +
      cleaned.substring(4, 7) +
      " " +
      cleaned.substring(7, 9) +
      " " +
      cleaned.substring(9);
  }
  return formatted;
}
