export class InquiryMessageResponseDto {
  messageId: string;
  senderUserId: string | null;
  type: string;
  body: string;
  createdAt: Date;
}

export class InquiryResponseDto {
  inquiryId: string;
  facilityId: string;
  createdByUserId: string;
  subject: string;
  status: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  messages: InquiryMessageResponseDto[];
}

export class InquiryListItemResponseDto {
  inquiryId: string;
  facilityId: string;
  createdByUserId: string;
  subject: string;
  status: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class InquiryListResponseDto {
  items: InquiryListItemResponseDto[];
  page: number;
  pageSize: number;
  total: number;
}