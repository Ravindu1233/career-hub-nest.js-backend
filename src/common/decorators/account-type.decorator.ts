import { SetMetadata } from '@nestjs/common';
import { AccountType } from '../types/jwt-payload.type';

export const ACCOUNT_TYPE_KEY = 'accountType';
export const AccountTypeRequired = (...types: AccountType[]) =>
  SetMetadata(ACCOUNT_TYPE_KEY, types);
