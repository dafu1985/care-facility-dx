import {
  CreateInquiryResponseDto,
  InquiryListItemResponseDto,
  InquiryMessageResponseDto,
  InquiryResponseDto,
} from './dto/inquiry-response.dto';
import { InquiryMessage } from './entities/inquiry-message.entity';
import { Inquiry } from './entities/inquiry.entity';

export class InquiryMapper {
  static toCreateResponse(
    inquiry: Inquiry,
  ): CreateInquiryResponseDto {
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

  static toMessageResponse(
    message: InquiryMessage,
  ): InquiryMessageResponseDto {
    return {
      messageId: message.messageId,
      senderUserId: message.senderUserId,
      type: message.type,
      body: message.body,
      createdAt: message.createdAt,
    };
  }

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
      messages: (inquiry.messages ?? []).map((message) =>
        this.toMessageResponse(message),
      ),
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