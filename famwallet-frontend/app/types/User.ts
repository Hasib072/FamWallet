// app/types/User.ts

export interface User {
    id: string;
    name: string;
    email: string;
    mobileNumber: string;
    dateOfBirth?: string; // ISO8601 format
    gender?: 'Male' | 'Female' | 'Other';
    isDependent: boolean;
    createdAt: string;
  }
  