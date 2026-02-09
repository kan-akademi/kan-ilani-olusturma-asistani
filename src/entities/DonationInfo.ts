export interface DonationInfo {
  bloodGroup: string;
  bloodType: string[]
  fullName: string;
  phone: string;
  date: string;
  dateRegularNeed: string;
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
  dateRegularNeed: "",
  isRegularNeed: false,
  hospital: "",
  location: "",
};