interface TokenData {
  nickname: string;
  permission: string;
}

declare namespace Express {
  export interface Request {
    user?: TokenData;
    isAuth: boolean;
  }

  export interface Response {
    authError: () => Promise<any>;
  }
}
