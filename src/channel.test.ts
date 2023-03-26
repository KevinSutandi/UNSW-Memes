import {
  authRegister,
  clearV1,
  channelsCreate,
  channelMessage,
} from './httpHelper';
import { AuthReturn } from './interfaces';

const ERROR = { error: expect.any(String) };

describe('testing channelMessage (ALL INVALID CASES)', () => {
  let user1: AuthReturn, user2: AuthReturn, user3: AuthReturn;
  let channel1: { channelId: number },
    channel2: { channelId: number },
    channel3: { channelId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister(
      'someotheremail@gmail.com',
      'someone2031',
      'Jonah',
      'Meggs'
    );
    user3 = authRegister(
      'z5352065@ad.unsw.edu.au',
      'big!password3',
      'Zombie',
      'Ibrahim'
    );
    channel1 = channelsCreate(user1.token, 'wego', true);
    channel2 = channelsCreate(user2.token, 'lesgo', true);
    channel3 = channelsCreate(user3.token, 'yes', false);
  });
  test('channelId does not exist test', () => {
    expect(
      channelMessage(user1.token, channel1.channelId + 100000, 0)
    ).toStrictEqual(ERROR);
  });
  test('token does not exist test', () => {
    expect(
      channelMessage(user3.token + 999, channel3.channelId, 0)
    ).toStrictEqual(ERROR);
  });
  test('User is not in channel (cannot read messages)', () => {
    expect(channelMessage(user3.token, channel2.channelId, 0)).toStrictEqual(
      ERROR
    );
  });
  test('start index is greater than the number of messages', () => {
    expect(
      channelMessage(user2.token, channel2.channelId, 999999)
    ).toStrictEqual(ERROR);
  });
  test('No Messages in channel (expect empty array)', () => {
    expect(channelMessage(user2.token, channel2.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
});

describe('testing channelMessage (ALL VALID CASES)', () => {
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

  test('30 messages in the channel', () => {
    for (let i = 0; i < 30; i++) {
      sendMessage(user1.token, channel1.channelId, 'hello ${i}');
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
      sendMessage(user1.token, channel1.channelId, 'hello shin ${i}');
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
