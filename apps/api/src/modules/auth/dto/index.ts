import { IsEmail, IsString, MinLength, MaxLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class SignupDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: "password must contain an uppercase letter" })
  @Matches(/[a-z]/, { message: "password must contain a lowercase letter" })
  @Matches(/[0-9]/, { message: "password must contain a number" })
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty({ example: "NewPassword123!" })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
