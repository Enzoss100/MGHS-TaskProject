export interface UserDetails {
  firstname: string;
  lastname: string;
  mghsemail: string;
  personalemail: string;
  schoolemail: string;
  uid: string;
  id?: string;
  role?: string;
  admin: boolean;
  position?: string;
  onboarded: string;
  startDate?: Date | null;
  hoursNeeded: number;
  totalHoursRendered: number;
  batchName: string;
  absences?: Absence[];
}

export interface Absence {
  absenceDate: Date;
  reason?: string;
}
