export type AccountType = 'USER' | 'COMPANY' | 'ADMIN';

export type JwtPayload = {
  sub: number; // userId / companyId / adminId
  type: AccountType; // USER | COMPANY | ADMIN
};
