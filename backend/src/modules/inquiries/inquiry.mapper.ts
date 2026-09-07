import { Inquiry } from './entities/inquiry.entity';
import {
  InquiryListItemResponseDto,
  InquiryResponseDto,
} from './dto/inquiry-response.dto';

export class InquiryMapper {
  static toResponse(
    inquiry: Inquiry,
  ): InquiryResponseDto {
    return {
      inquiryId: inquiry.inquiryId,
      facilityId: inquiry.facilityId,
      createdByUserId: inquiry.createdByUserId,
      subject: inquiry.subject,
      status: inquiry.status,
      lastMessageAt: inquiry.lastMessageAt,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
      messages: (inquiry.messages ?? []).map((message) => ({
        messageId: message.messageId,
        senderUserId: message.senderUserId,
        type: message.type,
        body: message.body,
        createdAt: message.createdAt,
      })),
    };
  }

  static toListItemResponse(
    inquiry: Inquiry,
  ): InquiryListItemResponseDto {
    return {
      inquiryId: inquiry.inquiryId,
      facilityId: inquiry.facilityId,
      createdByUserId: inquiry.createdByUserId,
      subject: inquiry.subject,
      status: inquiry.status,
      lastMessageAt: inquiry.lastMessageAt,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
    };
  }

  static toListResponse(
    inquiries: Inquiry[],
  ): InquiryListItemResponseDto[] {
    return inquiries.map((inquiry) =>
      this.toListItemResponse(inquiry),
    );
  }
}