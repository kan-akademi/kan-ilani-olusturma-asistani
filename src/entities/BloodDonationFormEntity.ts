import type { CoordinateEntity } from "./CoordinateEntity";

export interface BloodDonationFormEntity {
  bloodGroup: { value: string; coord: CoordinateEntity };
  bloodType: { value: string[]; coord: CoordinateEntity };
  fullName: { value: string; coord: CoordinateEntity };
  phone: { value: string; coord: CoordinateEntity };
  date: { value: string; coord: CoordinateEntity };
  hospital: { value: string; coord: CoordinateEntity };
  location: { value: string; coord: CoordinateEntity };
}
