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
  roles?: string[];
  permissions?: string[];
}

export interface AuthorizeVO {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  role?: string | null;
}

export interface LoginParams { 
  username: string;
  password: string;
}

export interface RegisterParams {
  username?: string;
  nickname?: string;
  sex?: number;
  birthday?: string;
  introduction?: string;
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
