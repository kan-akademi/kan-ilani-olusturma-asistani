export type FontRule = { max: number; size: number, coord?: { top: number; left: number }; };

export interface TextFieldBase {
  value: string;
  coord: { top: number; left: number };
}

export interface TextFieldWithDynamicFont extends TextFieldBase {
  fontRules: FontRule[];
  defaultFontSize: number;
  minFontSize?: number;
}

export type BloodDonationFormEntity = {
  bloodGroup: TextFieldBase;
  bloodType: TextFieldBase;
  fullName: TextFieldWithDynamicFont;
  phone: TextFieldBase;
  date: TextFieldBase;
  hospital: TextFieldBase;
  location: TextFieldWithDynamicFont;
};