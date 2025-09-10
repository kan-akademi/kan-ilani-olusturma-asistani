import type { CoordinateEntity } from "./CoordinateEntity";
import { Dayjs } from 'dayjs';

export interface BloodDonationFormEntity {
  bloodGroup: { value: string; coord: CoordinateEntity };
  bloodType: { value: string; coord: CoordinateEntity };
  fullName: { value: string; coord: CoordinateEntity };
  phone: { value: string; coord: CoordinateEntity };
  date: { value: Dayjs; coord: CoordinateEntity };
  hospital: { value: string; coord: CoordinateEntity };
  location: { value: string; coord: CoordinateEntity };
}
