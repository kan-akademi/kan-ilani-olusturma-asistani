import { formatDateToTurkish } from "../utils/formUtils";

export interface DonationInfo {
  bloodGroup: string;
  bloodType: string[]
  fullName: string;
  phone: string;
  date: string;
  dateFormated: string;
  isRegularNeed: boolean;
  hospital: string;
  location: string;
}

export const initialDonationInfo: DonationInfo = {
  bloodGroup: "",
  bloodType: [],
  fullName: "",
  phone: "",
  date: new Date().toLocaleDateString("en-CA"),
  dateFormated: formatDateToTurkish(new Date().toLocaleDateString("en-CA")),
  isRegularNeed: false,
  hospital: "",
  location: "",
};