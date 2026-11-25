import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import {
  CreateInquiryMessageDto,
  INQUIRY_MESSAGE_MAX_LENGTH,
} from './create-inquiry-message.dto';

describe('CreateInquiryMessageDto', () => {
  /**
   * リクエストデータをDTOへ変換し、
   * バリデーションを実行する。
   */
  async function validateBody(body: unknown) {
    const dto = plainToInstance(CreateInquiryMessageDto, {
      body,
    });

    const errors = await validate(dto);

    return { dto, errors };
  }

  it('正常なメッセージを許可する', async () => {
    const { errors } = await validateBody('現在2床空いています。');

    expect(errors).toHaveLength(0);
  });

  it('前後の空白を除去する', async () => {
    const { dto, errors } = await validateBody('  現在2床空いています。  ');

    expect(dto.body).toBe('現在2床空いています。');
    expect(errors).toHaveLength(0);
  });

  it('空文字を拒否する', async () => {
    const { errors } = await validateBody('');

    expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
  });

  it('空白のみのメッセージを拒否する', async () => {
    const { errors } = await validateBody('   ');

    expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
  });

  it('改行やタブのみのメッセージを拒否する', async () => {
    const { errors } = await validateBody('\n\t\r\n');

    expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
  });

  it('nullを拒否する', async () => {
    const { errors } = await validateBody(null);

    expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
  });

  it('undefinedを拒否する', async () => {
    const { errors } = await validateBody(undefined);

    expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
  });

  it('数値を拒否する', async () => {
    const { errors } = await validateBody(12345);

    expect(errors[0]?.constraints).toHaveProperty('isString');
  });

  it('オブジェクトを拒否する', async () => {
    const { errors } = await validateBody({
      message: 'test',
    });

    expect(errors[0]?.constraints).toHaveProperty('isString');
  });

  it('最大文字数ちょうどのメッセージを許可する', async () => {
    const body = 'あ'.repeat(INQUIRY_MESSAGE_MAX_LENGTH);

    const { errors } = await validateBody(body);

    expect(errors).toHaveLength(0);
  });

  it('最大文字数を超えるメッセージを拒否する', async () => {
    const body = 'あ'.repeat(INQUIRY_MESSAGE_MAX_LENGTH + 1);

    const { errors } = await validateBody(body);

    expect(errors[0]?.constraints).toHaveProperty('maxLength');
  });

  it('本文途中の改行を維持する', async () => {
    const body = '現在2床空いています。\n来週の見学も可能です。';

    const { dto, errors } = await validateBody(body);

    expect(dto.body).toBe(body);
    expect(errors).toHaveLength(0);
  });

  it('前後の空白除去後の文字数で判定する', async () => {
    const body = 'あ'.repeat(INQUIRY_MESSAGE_MAX_LENGTH);

    const { dto, errors } = await validateBody(`  ${body}  `);

    expect(dto.body).toBe(body);
    expect(errors).toHaveLength(0);
  });

  it('絵文字をUnicodeコードポイント単位で判定する', async () => {
    const body = '😀'.repeat(INQUIRY_MESSAGE_MAX_LENGTH);

    const { dto, errors } = await validateBody(body);

    expect(dto.body).toBe(body);
    expect(errors).toHaveLength(0);
  });

  it('絵文字でも最大文字数を超える場合は拒否する', async () => {
    const body = '😀'.repeat(INQUIRY_MESSAGE_MAX_LENGTH + 1);

    const { errors } = await validateBody(body);

    expect(errors[0]?.constraints).toHaveProperty('maxLength');
  });

  it('日本語と絵文字が混在する場合も正しく判定する', async () => {
    const body = 'あ😀'.repeat(INQUIRY_MESSAGE_MAX_LENGTH / 2);

    const { dto, errors } = await validateBody(body);

    expect(dto.body).toBe(body);
    expect(errors).toHaveLength(0);
  });
});
