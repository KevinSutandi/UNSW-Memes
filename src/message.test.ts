import {
  authRegister,
  channelMessage,
  channelsCreate,
  clearV1,
  messageSend,
  messageRemove,
  messageEdit,
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

  afterEach(() => {
    clearV1();
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

describe('testing removeMessages', () => {
  let user1: AuthReturn;
  let channel1: { channelId: number };
  let message1: { messageId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    channel1 = channelsCreate(user1.token, 'wego', true);
    message1 = messageSend(user1.token, channel1.channelId, 'test moments');
  });

  afterEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    expect(
      messageRemove('laskdjflkasdfinvalid', message1.messageId)
    ).toStrictEqual(ERROR);
  });
  test('user is not in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    expect(messageRemove(user2.token, message1.messageId)).toStrictEqual(ERROR);
  });
  test('message does not exist', () => {
    expect(messageRemove(user1.token, message1.messageId + 200)).toStrictEqual(
      ERROR
    );
  });
  test('remove own message', () => {
    expect(messageRemove(user1.token, message1.messageId)).toStrictEqual({});
    expect(channelMessage(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
  /**
   *   Will add more tests when channelJoin is available to test multiple user in channel
   *   for now it is commented out
   */
  /*
  test('remove other user message when user is globalOwner', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    const channel2 = channelsCreate(user2.token, 'wego', true);
    channelJoin(user1.token, channel2.channelId);
    const message2 = messageSend(user2.token, channel2.channelId, 'test moments');
    expect(messageRemove(user1.token, message2.messageId)).toStrictEqual({});
  });
  test('remove other user message when user is channelOwner', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    const user3 = authRegister(
      'welovedogs@gmail.com'
      'doglover1001',
      'Dog',
      'Lomer'
    );
    const channel2 = channelsCreate(user2.token, 'wego', true);
    channelJoin(user3.token, channel2.channelId);
    const message3 = messageSend(user3.token, channel2.channelId, 'dogs are bad');
    expect(messageRemove(user2.token, message3.messageId)).toStrictEqual({});
  });
  test('remove other user message when user is channelMember', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    channelJoin(user2.token, channel1.channelId);
    expect(messageRemove(user2.token, message1.messageId)).toStrictEqual(ERROR);
  });
  test('remove own message while not channelOwner', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    channelJoin(user2.token, channel1.channelId);
    const message2 = messageSend(user2.token, channel1.channelId, 'test moments');
    expect(messageRemove(user2.token, message2.messageId)).toStrictEqual({});
  });
   */
});

describe('testing messageEdit', () => {
  let user1: AuthReturn;
  let channel1: { channelId: number };
  let message1: { messageId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    channel1 = channelsCreate(user1.token, 'wego', true);
    message1 = messageSend(user1.token, channel1.channelId, 'test moments');
  });

  afterEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    expect(
      messageEdit('invalidtoken', message1.messageId, 'hello')
    ).toStrictEqual(ERROR);
  });

  test('user is not in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    expect(messageEdit(user2.token, message1.messageId, 'hello')).toStrictEqual(
      ERROR
    );
  });

  test('message does not exist', () => {
    expect(
      messageEdit(user1.token, message1.messageId + 200, 'hello')
    ).toStrictEqual(ERROR);
  });

  test('message length over 1000', () => {
    expect(
      messageEdit(user1.token, message1.messageId, 'a'.repeat(1001))
    ).toStrictEqual(ERROR);
  });

  test('delete message when message string empty', () => {
    expect(messageEdit(user1.token, message1.messageId, '')).toStrictEqual({});
    expect(channelMessage(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('cannot edit message after deleting', () => {
    expect(messageEdit(user1.token, message1.messageId, '')).toStrictEqual({});
    expect(
      messageEdit(user1.token, message1.messageId, 'hello world')
    ).toStrictEqual(ERROR);
  });

  test('edit own message', () => {
    expect(
      messageEdit(user1.token, message1.messageId, 'hello world')
    ).toStrictEqual({});
    expect(channelMessage(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'hello world',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });

  /**
   *  Will enable tests when channelJoin is available to test multiple user in channel
   */

  /*
  test('edit other user message when user is globalOwner in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    const channel2 = channelsCreate(user2.token, 'wego', true);
    channelJoin(user1.token, channel2.channelId);
    const message2 = messageSend(user2.token, channel2.channelId, 'test moments');
    expect(
      messageEdit(user1.token, message2.messageId, 'hello world')
    ).toStrictEqual({});
    expect(channelMessage(user1.token, channel2.channelId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message2.messageId,
          uId: user2.authUserId,
          message: 'hello world',
          timeSent: expect.any(Number),
        }
      ],
      start: 0,
      end: -1,
    });
  });
  test('edit other user message when user is channelOwner', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    const user3 = authRegister(
      'burneremail304@gmail.com',
      'lesgo1001',
      'Bevin',
      'DONGO'
    );
    const channel2 = channelsCreate(user2.token, 'wego', true);
    channelJoin(user3.token, channel2.channelId);
    const message3 = messageSend(user3.token, channel2.channelId, 'test moments');
    expect(
      messageEdit(user2.token, message3.messageId, 'hello world')
    ).toStrictEqual({});
    expect(channelMessage(user2.token, channel2.channelId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: user3.authUserId,
          message: 'hello world',
          timeSent: expect.any(Number),
        }
      ],
      start: 0,
      end: -1,
    });
  });

  */
});
