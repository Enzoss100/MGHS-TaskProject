export interface UserDetails {
  firstname: string;
  lastname: string;
  mghsemail: string;
  personalemail: string;
  schoolemail: string;
  uid: string;
  id?: string;
  role?:string;
  admin: boolean;
  position?:string;
  onboarded: string;
  startDate: Date;
  hoursNeeded: number;
  totalHoursRendered: number;
  batchName: string;
}