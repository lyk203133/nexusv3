export interface UserInfo {
  nickname: string;
  avatar: string | null;
}

export interface TransactionItem {
  id: string;
  orderNo: string;
  type: 'buy' | 'sell';
  target: 'platform' | 'merchant' | 'member';
  amount: number;
  fee: number;
  bonus: number;
  status: 'success' | 'pending' | 'cancelled' | 'abnormal';
  date: string;
}

export interface ListItem {
  id: number;
  name: string;
  rating: number;
  amount: number;
  type: 'buy' | 'sell';
  bonus: string | null;
  time: string;
}

export interface Notification {
  id: number;
  type: 'success' | 'pending' | 'cancelled';
  title: { zh: string; en: string; vi: string };
  content: { zh: string; en: string; vi: string };
  time: string;
  isRead: boolean;
}

export interface Announcement {
  id: number;
  title: { zh: string; en: string; vi: string };
  time: string;
  content: { zh: string; en: string; vi: string };
  isRead: boolean;
}

export interface Referral {
  id: number;
  name: string;
  date: string;
  reward: number;
}

export interface MembershipLevel {
  level: string;
  name: string;
  fee: string;
  limit: string;
  bonus: string;
  color: string;
  border: string;
  exp: string;
}

export type Language = 'zh-TW' | 'en-US' | 'vi-VN';

export type ViewName = 
  | 'login'
  | 'forgot-password'
  | 'register'
  | 'dashboard'
  | 'trade-buy'
  | 'trade-sell'
  | 'profile'
  | 'transaction-history'
  | 'notifications'
  | 'points-mall'
  | 'my-wallet'
  | 'withdraw'
  | 'system-announcements'
  | 'payment-account'
  | 'customer-service'
  | 'referral-center'
  | 'membership'
  | 'security-center'
  | 'change-password'
  | 'change-pin';

export interface ViewProps {
  navigate: (view: ViewName, data?: any) => void;
  t: any;
  lang: Language;
  setLang: (lang: Language) => void;
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
  data?: any;
}


//=============新加入

// 登录相关类型
export interface LoginCredentials {
  account: string;
  password: string;
  captcha?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    account: string;
    email?: string;
    avatar?: string;
    points?: number;
    level?: number;
  };
  expiresIn?: number;
}

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

 