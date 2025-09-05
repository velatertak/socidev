export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
  balance: number;
  role: "user" | "admin";
  userMode: "taskDoer" | "taskGiver";
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  balance: number;
}
