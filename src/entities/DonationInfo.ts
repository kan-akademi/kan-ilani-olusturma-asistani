import { formatDateToTurkish } from "../utils/formUtils";

export const REGARDLESS_BLOOD_GROUP = "Kan Grubu Fark Etmeksizin" as const;
export const MAX_BLOOD_GROUP_SELECTION = 4;

/**
 * Indirme icin gereken en kisa telefon numarasi.
 *
 * Girilen telefon maskelidir ("0532 123 45 67"), yani bu deger rakam
 * sayisindan uzun; kural once de maskeli haliyle tanimlanmisti ve oyle
 * kaldi. Degistirmek icin `isDonationInfoComplete` ve indirme yolu
 * birlikte guncellenmeli.
 */
export const MIN_PHONE_LENGTH = 11;

export interface DonationInfo {
  bloodGroup: string[];
  bloodGroup1: string[];
  bloodGroup2: string[];
  bloodType: string[]
  fullName: string;
  phone: string;
  date: string;
  dateFormatted: string;
  isRegularNeed: boolean;
  hospital: string;
  location: string;
}

/** Indirme icin zorunlu olan alanlar (sira, uyari mesajinda kullanilir). */
export const REQUIRED_FIELDS = [
  "bloodGroup",
  "bloodType",
  "fullName",
  "phone",
  "date",
  "hospital",
  "location",
] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

/** Zorunlu alanlardan bos/eksik olanlarin alan adlari. */
export function missingRequiredFields(info: DonationInfo): RequiredField[] {
  return REQUIRED_FIELDS.filter((field) => !isFilled(info[field]));
}

/**
 * Indirmeye izin veriliyor mu? - "Galerine kaydet" yonlendirme oku
 * TAM OLARAK bu fonksiyona baglanir.
 *
 * ONCEDEN iki ayri, birbirinden habersiz dogrulama vardi: ok yalnizca
 * "alanlar dolu mu" diye bakarken indirme yolu ayrica telefonun
 * `MIN_PHONE_LENGTH` kadar uzun olmasini istiyordu. Sonuc: 6 haneli
 * telefon yazan kullanici "hazir, indir" okunu goruyor, butona
 * basinca "gecersiz telefon" uyarisi aliyordu. Ok yalan soyluyordu.
 * Simdi tek kural var ve ok onunla ayni.
 */
export function isDonationInfoComplete(info: DonationInfo): boolean {
  return missingRequiredFields(info).length === 0 && info.phone.length >= MIN_PHONE_LENGTH;
}

export const initialDonationInfo: DonationInfo = {
  bloodGroup: [],
  bloodGroup1: [],
  bloodGroup2: [],
  bloodType: [],
  fullName: "",
  phone: "",
  date: new Date().toLocaleDateString("en-CA"),
  dateFormatted: formatDateToTurkish(new Date().toLocaleDateString("en-CA")),
  isRegularNeed: false,
  hospital: "",
  location: "",
};