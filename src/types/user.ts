export interface UserAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  primary: boolean;
}

export interface UserRole {
  name: string;
  description: string;
  permissions: any[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  phoneNumber: string | null;
  points: number;
  roles: UserRole[];
  addresses: UserAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  code: number;
  result: User[];
}
