import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateInquiryMessageDto {
  @IsUUID()
  senderUserId: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}