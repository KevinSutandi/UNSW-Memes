import {
  authRegister,
  channelMessage,
  channelsCreate,
  clearV1,
  messageSend,
} from './httpHelper';
import { AuthReturn } from './interfaces';

const ERROR = { error: expect.any(String) };

describe('testing sendMessages', () => {
  let user1: AuthReturn;
  let channel1: { channelId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    channel1 = channelsCreate(user1.token, 'wego', true);
  });

  test('channel does not exist', () => {
    expect(
      messageSend(user1.token, channel1.channelId + 200, 'hello world')
    ).toStrictEqual(ERROR);
  });

  test('length of message is below 1 character', () => {
    expect(messageSend(user1.token, channel1.channelId, '')).toStrictEqual(
      ERROR
    );
  });

  test('length of message is above 1000 characters', () => {
    const message = 'a'.repeat(1001);
    expect(messageSend(user1.token, channel1.channelId, message)).toStrictEqual(
      ERROR
    );
  });

  test('user is not in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    expect(
      messageSend(user2.token, channel1.channelId, 'hello world')
    ).toStrictEqual(ERROR);
  });
  test('token is invalid', () => {
    expect(
      messageSend('laskdjflkasdfinvalid', channel1.channelId, 'hello world')
    ).toStrictEqual(ERROR);
  });

  test('valid message should return messageId', () => {
    const result = messageSend(user1.token, channel1.channelId, 'hello world');
    expect(result).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('10 valid messages all diff id', () => {
    const result = [];
    for (let i = 0; i < 10; i++) {
      result.push(
        messageSend(user1.token, channel1.channelId, `hello world number ${i}`)
      );
    }
    const ids = result.map((message) => message.messageId);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  test('30 messages in the channel', () => {
    for (let i = 0; i < 30; i++) {
      messageSend(user1.token, channel1.channelId, `hello world number ${i}`);
    }

    const result = channelMessage(user1.token, channel1.channelId, 0);
    const numMessages = result.messages.length;
    expect(result).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
    expect(numMessages).toBe(30);
  });

  test('more than 50 messages in the channel', () => {
    for (let i = 0; i < 60; i++) {
      messageSend(user1.token, channel1.channelId, `hello ${i}`);
    }

    const result = channelMessage(user1.token, channel1.channelId, 0);
    const result2 = channelMessage(user1.token, channel1.channelId, 50);
    const numMessages = result.messages.length;
    const numMessages2 = result2.messages.length;
    expect(result).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50,
    });
    expect(numMessages).toBe(50);
    expect(result2).toStrictEqual({
      messages: expect.any(Array),
      start: 50,
      end: -1,
    });
    expect(numMessages2).toBe(10);
  });
});
