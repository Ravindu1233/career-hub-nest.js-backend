import { IsEmail, IsString } from 'class-validator';

export class CompanyLoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}
