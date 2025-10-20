import type { CoordinateEntity } from "./CoordinateEntity";

export interface BloodDonationFormEntity {
  bloodGroup: { value: string; coord: CoordinateEntity };
  bloodType: { value: string[]; coord: CoordinateEntity; fontSize: number };
  fullName: { value: string; coord: CoordinateEntity; fontSize: number };
  phone: { value: string; coord: CoordinateEntity };
  date: { value: string; coord: CoordinateEntity };
  hospital: { value: string; coord: CoordinateEntity };
  location: { value: string; coord: CoordinateEntity; fontSize: number };
}
