export interface UserInfo {
  uid: number;
  username: string;
  nickname: string;
  sex: number;
  birthday: string;
  introduction: string;
  email: string;
  emailVerified: boolean;
  password: string;
  avatar: string;
  level: number;
  following: number;
  follower: number;
  dynamicCount: number;
  coins: number;
  role?: string;
}

export interface AuthorizeVO {
  token: string;
  expire: string;
  role?: string | null;
}

export interface LoginParams { 
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  code: string;
}

export interface AccountProfileParams {
  uid?: number;
  nickname: string;
  sex: number;
  birthday?: string;
  introduction?: string;
  avatarFile?: File | null | undefined;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
