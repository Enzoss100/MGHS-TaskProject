export interface UserDetails {
  firstname: string;
  lastname: string;
  mghsemail: string;
  personalemail: string;
  schoolemail: string;
  uid: string;
  id?: string;
  admin: boolean;
  onboarded: boolean;
  role?:string;
  position?:string;
  startDate: Date;
}