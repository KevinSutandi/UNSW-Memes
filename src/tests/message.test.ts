import { getCurrentTime, badRequest, forbidden } from '../functionHelper';
import {
  authRegister,
  channelMessage,
  channelsCreate,
  clearV1,
  messageSend,
  messageRemove,
  messageEdit,
  channelJoin,
  dmCreate,
  messageSendDm,
  dmMessages,
  messagePinV1,
  messageUnpinV1,
  searchV1,
  notificationsGetV1,
  messageSendLater,
  messageSendLaterDm,
  messageShare,
  channelInvite,
  messageReact,
  messageUnReact,
} from '../httpHelper';
import { AuthReturn, newMessageReturn, dmCreateReturn } from '../interfaces';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms * 1000));
}

const NUM = expect.any(Number);

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
    ).toStrictEqual(badRequest);
  });

  test('length of message is below 1 character', () => {
    expect(messageSend(user1.token, channel1.channelId, '')).toStrictEqual(
      badRequest
    );
  });

  test('length of message is above 1000 characters', () => {
    const message = 'a'.repeat(1001);
    expect(messageSend(user1.token, channel1.channelId, message)).toStrictEqual(
      badRequest
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
    ).toStrictEqual(forbidden);
  });
  test('token is invalid', () => {
    expect(
      messageSend('laskdjflkasdfinvalid', channel1.channelId, 'hello world')
    ).toStrictEqual(forbidden);
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
    expect(ids.length).toStrictEqual(uniqueIds.size);
  });

  test('30 messages in the channel', () => {
    const messageIds = [];
    for (let i = 0; i < 30; i++) {
      messageIds[i] = messageSend(
        user1.token,
        channel1.channelId,
        `hello world number ${i}`
      );
    }

    messageIds.reverse();
    const result = channelMessage(user1.token, channel1.channelId, 0);
    const numMessages = result.messages.length;
    for (let i = 0; i < 30; i++) {
      expect(result.messages[i]).toStrictEqual({
        messageId: messageIds[i].messageId,
        uId: user1.authUserId,
        message: `hello world number ${numMessages - i - 1}`,
        timeSent: expect.any(Number),
        isPinned: false,
        reacts: [],
      });
    }
    expect(result).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
    expect(numMessages).toStrictEqual(30);
  });

  test('more than 50 messages in the channel', () => {
    const messageIds = [];
    for (let i = 0; i < 60; i++) {
      messageIds[i] = messageSend(
        user1.token,
        channel1.channelId,
        `hello ${i}`
      );
    }

    messageIds.reverse();

    const result = channelMessage(user1.token, channel1.channelId, 0);
    const result2 = channelMessage(user1.token, channel1.channelId, 50);
    const numMessages = result.messages.length;
    const numMessages2 = result2.messages.length;
    expect(result).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50,
    });
    expect(numMessages).toStrictEqual(50);
    expect(result2).toStrictEqual({
      messages: expect.any(Array),
      start: 50,
      end: -1,
    });
    expect(numMessages2).toStrictEqual(10);
    for (let i = 0; i < 50; i++) {
      expect(result.messages[i].messageId).toStrictEqual(
        messageIds[i].messageId
      );
    }
    for (let i = 0; i < 10; i++) {
      expect(result2.messages[i].messageId).toStrictEqual(
        messageIds[i + 50].messageId
      );
    }
  });
});

describe('testing removeMessages Error Cases and Channels', () => {
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
    ).toStrictEqual(forbidden);
  });
  test('user is not in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    expect(messageRemove(user2.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });
  test('message does not exist', () => {
    expect(messageRemove(user1.token, message1.messageId + 200)).toStrictEqual(
      badRequest
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
  test('remove other user message when user is globalOwner', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    const channel2 = channelsCreate(user2.token, 'wego', true);
    channelJoin(user1.token, channel2.channelId);
    const message2 = messageSend(
      user2.token,
      channel2.channelId,
      'test moments'
    );
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
      'welovedogs@gmail.com',
      'doglover1001',
      'Dog',
      'Lomer'
    );
    const channel2 = channelsCreate(user2.token, 'wego', true);
    channelJoin(user3.token, channel2.channelId);
    const message3 = messageSend(
      user3.token,
      channel2.channelId,
      'dogs are bad'
    );
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
    expect(messageRemove(user2.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });
  test('remove own message while not channelOwner', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    channelJoin(user2.token, channel1.channelId);
    const message2 = messageSend(
      user2.token,
      channel1.channelId,
      'test moments'
    );
    expect(messageRemove(user2.token, message2.messageId)).toStrictEqual({});
  });
});

describe('testing removeMessages DM', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let dm1: { dmId: number };
  let dm2: { dmId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister(
      'asdwer@gmail.com',
      'welovesoccer1001',
      'Soccer',
      'Boy'
    );
    const uIds1 = [user2.authUserId];
    dm1 = dmCreate(user1.token, uIds1);
    const uIds2 = [user1.authUserId];
    dm2 = dmCreate(user2.token, uIds2);
  });

  afterEach(() => {
    clearV1();
  });

  test('dm does not exist', () => {
    expect(messageRemove(user1.token, 100000)).toStrictEqual(badRequest);
  });

  test('remove own message', () => {
    const message1 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(messageRemove(user1.token, message1.messageId)).toStrictEqual({});
    expect(dmMessages(user1.token, dm1.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('remove own message 2', () => {
    const message1 = messageSendDm(user2.token, dm1.dmId, 'test moments');
    expect(messageRemove(user2.token, message1.messageId)).toStrictEqual({});
    expect(dmMessages(user2.token, dm1.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('owner remove other message', () => {
    const message2 = messageSendDm(user1.token, dm2.dmId, 'test moments');
    expect(messageRemove(user2.token, message2.messageId)).toStrictEqual({});
    expect(dmMessages(user1.token, dm1.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('owner remove other message 2', () => {
    const message2 = messageSendDm(user2.token, dm1.dmId, 'test moments');
    expect(messageRemove(user1.token, message2.messageId)).toStrictEqual({});
    expect(dmMessages(user1.token, dm1.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('globalOwner cannot remove other message', () => {
    const user3 = authRegister(
      'soccer@gmail.com',
      'levin2042',
      'welove',
      'dogs'
    );
    const uIds = [user1.authUserId, user2.authUserId];
    const dm3 = dmCreate(user3.token, uIds);
    const message2 = messageSendDm(user3.token, dm3.dmId, 'test moments');
    expect(messageRemove(user1.token, message2.messageId)).toStrictEqual(
      forbidden
    );
  });

  test('member remove other message', () => {
    const message1 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(messageRemove(user2.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });

  test('user not part of dm cannot remove message', () => {
    const user3 = authRegister(
      'wisellyw@gmail.com',
      'doglover1001',
      'Wiselly',
      'Mega'
    );
    const message1 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(messageRemove(user3.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });
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
    ).toStrictEqual(forbidden);
  });

  test('user is not in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    expect(messageEdit(user2.token, message1.messageId, 'hello')).toStrictEqual(
      forbidden
    );
  });

  test('message does not exist', () => {
    expect(
      messageEdit(user1.token, message1.messageId + 200, 'hello')
    ).toStrictEqual(badRequest);
  });

  test('message length over 1000', () => {
    expect(
      messageEdit(user1.token, message1.messageId, 'a'.repeat(1001))
    ).toStrictEqual(badRequest);
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
    ).toStrictEqual(badRequest);
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
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('edit other user message when user is globalOwner in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    const channel2 = channelsCreate(user2.token, 'wego', true);
    channelJoin(user1.token, channel2.channelId);
    const message2 = messageSend(
      user2.token,
      channel2.channelId,
      'test moments'
    );
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
          isPinned: false,
          reacts: [],
        },
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
    const message3 = messageSend(
      user3.token,
      channel2.channelId,
      'test moments'
    );
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
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('edit other user message when user is channelMember', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    channelJoin(user2.token, channel1.channelId);
    expect(
      messageEdit(user2.token, message1.messageId, 'hello world')
    ).toStrictEqual(forbidden);
  });
});

describe('testing messageEdit DM', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let dm1: { dmId: number };
  let dm2: { dmId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister(
      'asdwer@gmail.com',
      'welovesoccer1001',
      'Soccer',
      'Boy'
    );
    const uIds = [user2.authUserId];
    dm1 = dmCreate(user1.token, uIds);
    const uIds2 = [user1.authUserId];
    dm2 = dmCreate(user2.token, uIds2);
  });

  afterEach(() => {
    clearV1();
  });

  test('dm does not exist', () => {
    expect(messageEdit(user1.token, 100000, 'hello')).toStrictEqual(badRequest);
  });

  test('edit own message', () => {
    const message1 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(
      messageEdit(user1.token, message1.messageId, 'hello world')
    ).toStrictEqual({});
    expect(dmMessages(user1.token, dm1.dmId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'hello world',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('globalOwner cant edit dm Message', () => {
    const message2 = messageSendDm(user2.token, dm2.dmId, 'test moments');
    expect(
      messageEdit(user1.token, message2.messageId, 'hello world')
    ).toStrictEqual(forbidden);
  });

  test('channelOwner can edit dm Message', () => {
    const message3 = messageSendDm(user2.token, dm1.dmId, 'test moments');
    expect(
      messageEdit(user2.token, message3.messageId, 'hello world')
    ).toStrictEqual({});
    expect(dmMessages(user2.token, dm1.dmId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: user2.authUserId,
          message: 'hello world',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('message should be deleted from dm when edited with 0 char', () => {
    const message4 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(messageEdit(user1.token, message4.messageId, '')).toStrictEqual({});
    expect(dmMessages(user1.token, dm1.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('message is too long', () => {
    const message5 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(
      messageEdit(user1.token, message5.messageId, 'a'.repeat(1001))
    ).toStrictEqual(badRequest);
  });
});

describe('testing messageSendDm', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let dm1: { dmId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );

    user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Gabriel',
      'Hardman'
    );

    const uIds = [user2.authUserId];
    dm1 = dmCreate(user1.token, uIds);
  });

  afterEach(() => {
    clearV1();
  });

  test('dm does not exist', () => {
    expect(messageSendDm(user1.token, 100000, 'hello world')).toStrictEqual(
      badRequest
    );
  });

  test('invalid token', () => {
    expect(
      messageSendDm('abnomrklasdjflk', dm1.dmId, 'hello world')
    ).toStrictEqual(forbidden);
  });

  test('invalid messages', () => {
    expect(messageSendDm(user1.token, dm1.dmId, '')).toStrictEqual(badRequest);
    expect(
      messageSendDm(user1.token, dm1.dmId, 'a'.repeat(1001))
    ).toStrictEqual(badRequest);
  });

  test('non dm member send message', () => {
    const user3 = authRegister(
      'Hindie@gmail.com',
      'welovecows',
      'Hindie',
      'Suputra'
    );
    expect(messageSendDm(user3.token, dm1.dmId, 'hello world')).toStrictEqual(
      forbidden
    );
  });

  test('valid message', () => {
    expect(messageSendDm(user1.token, dm1.dmId, 'hello world')).toStrictEqual({
      messageId: expect.any(Number),
    });
  });
  test('valid message 2 ', () => {
    expect(messageSendDm(user2.token, dm1.dmId, 'hello world')).toStrictEqual({
      messageId: expect.any(Number),
    });
  });
});

describe('testing messageSendLater', () => {
  let user1: AuthReturn;
  let channel1: { channelId: number };
  let sendTime: number;
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
      messageSendLater(
        user1.token,
        channel1.channelId + 200,
        'hello world',
        sendTime + 2000
      )
    ).toStrictEqual(badRequest);
  });

  test('length of message is below 1 character', () => {
    expect(
      messageSendLater(user1.token, channel1.channelId, '', sendTime + 2000)
    ).toStrictEqual(badRequest);
  });

  test('length of message is above 1000 characters', () => {
    const message = 'a'.repeat(1001);
    expect(
      messageSendLater(
        user1.token,
        channel1.channelId,
        message,
        sendTime + 2000
      )
    ).toStrictEqual(badRequest);
  });

  test('user is not in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    expect(
      messageSendLater(
        user2.token,
        channel1.channelId,
        'hello world',
        sendTime + 2000
      )
    ).toStrictEqual(forbidden);
  });
  test('token is invalid', () => {
    expect(
      messageSendLater(
        'laskdjflkasdfinvalid',
        channel1.channelId,
        'hello world',
        sendTime + 2000
      )
    ).toStrictEqual(forbidden);
  });
  test('timeSent is a time in the past', () => {
    expect(
      messageSendLater(
        user1.token,
        channel1.channelId,
        'halooo',
        sendTime - 500
      )
    ).toStrictEqual(badRequest);
  });

  test('valid message should return messageId', async () => {
    const timeStamp = new Date().getTime();
    const result = messageSendLater(
      user1.token,
      channel1.channelId,
      'hello world',
      timeStamp + 2000
    );
    expect(result).toStrictEqual({ messageId: expect.any(Number) });
    // test datascript and test node messages and channel
    await new Promise((r) => setTimeout(r, 2000));
    // check channelmessage should contain
    expect(channelMessage(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
  });
});

describe('testing messageSendLaterDm', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let dm1: { dmId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );

    user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Gabriel',
      'Hardman'
    );

    const uIds = [user2.authUserId];
    dm1 = dmCreate(user1.token, uIds);
  });

  afterEach(() => {
    clearV1();
  });

  test('dm does not exist', () => {
    expect(
      messageSendLaterDm(user1.token, 100000, 'hello world', 50)
    ).toStrictEqual(badRequest);
  });

  test('invalid token', () => {
    expect(
      messageSendLaterDm('abnomrklasdjflk', dm1.dmId, 'hello world', 50)
    ).toStrictEqual(forbidden);
  });

  test('invalid messages', () => {
    expect(messageSendLaterDm(user1.token, dm1.dmId, '', 50)).toStrictEqual(
      badRequest
    );
    expect(
      messageSendLaterDm(user1.token, dm1.dmId, 'a'.repeat(1001), 50)
    ).toStrictEqual(badRequest);
  });

  test('non dm member send message', () => {
    const user3 = authRegister(
      'Hindie@gmail.com',
      'welovecows',
      'Hindie',
      'Suputra'
    );
    expect(
      messageSendLaterDm(user3.token, dm1.dmId, 'hello world', 50)
    ).toStrictEqual(forbidden);
  });

  test('timeSent is a time in the past', () => {
    // const timeStamp = new Date().getTime();
    expect(
      messageSendLaterDm(user1.token, dm1.dmId, 'haloo', 50)
    ).toStrictEqual(badRequest);
  });

  test('valid message', async () => {
    const timeStamp = new Date().getTime();
    expect(
      messageSendLaterDm(user1.token, dm1.dmId, 'hello world', timeStamp + 2000)
    ).toStrictEqual({
      messageId: expect.any(Number),
    });
    await new Promise((r) => setTimeout(r, 2000));
    expect(dmMessages(user1.token, dm1.dmId, 0)).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
  });
});

describe('testing messageShare', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel1: { channelId: number };
  let channel2: { channelId: number };

  let dm1: { dmId: number };
  let message1: { messageId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister('plswork@gmail.com', 'plswork', 'James', 'Bond');
    channel2 = channelsCreate(user2.token, 'name', false);

    channel1 = channelsCreate(user1.token, 'wego', true);
    channelJoin(user2.token, channel1.channelId);

    dm1 = dmCreate(user1.token, [user2.authUserId]);
    message1 = messageSend(user1.token, channel1.channelId, 'halo');
  });

  afterEach(() => {
    clearV1();
  });

  test('invalid token', () => {
    expect(
      messageShare('vroom', message1.messageId, '', channel1.channelId, -1)
    ).toStrictEqual(forbidden);
  });

  test('message does not exist', () => {
    expect(
      messageShare(
        user1.token,
        message1.messageId + 1,
        ',',
        channel1.channelId,
        -1
      )
    ).toStrictEqual(badRequest);
  });
  test('both channelId and dmId are invalid', () => {
    expect(
      messageShare(user1.token, message1.messageId, 'mantap', 15, 16)
    ).toStrictEqual(badRequest);
  });

  test('neither channelId nor dmId are -1', () => {
    expect(
      messageShare(
        user1.token,
        message1.messageId,
        'mantap',
        channel1.channelId,
        dm1.dmId
      )
    ).toStrictEqual(badRequest);
  });

  test('ogMessageId does not refer to a valid message within a channel that the authorised user has joined', () => {
    const channel2 = channelsCreate(user2.token, 'name', false);
    const message2 = messageSend(user2.token, channel2.channelId, 'makan');
    expect(
      messageShare(
        user1.token,
        message2.messageId,
        'ayam',
        channel1.channelId,
        -1
      )
    ).toStrictEqual(badRequest);
  });

  test('ogMessageId does not refer to a valid message within a dm that the authorised user has joined', () => {
    const user3 = authRegister(
      'johncena@gmail.com',
      '12345567788',
      'John',
      'Cena'
    );
    const dm2 = dmCreate(user2.token, [user3.authUserId]);
    const message2 = messageSendDm(user2.token, dm2.dmId, 'makan');
    expect(
      messageShare(
        user1.token,
        message2.messageId,
        'ayam',
        channel1.channelId,
        -1
      )
    ).toStrictEqual(badRequest);
  });

  test('length of optional message is more than 1000 characters', () => {
    expect(
      messageShare(
        user2.token,
        message1.messageId,
        '6'.repeat(1001),
        channel1.channelId,
        -1
      )
    ).toStrictEqual(badRequest);
  });

  test('valid input, but the user has not joined the channel they are trying to share the message to', () => {
    expect(
      messageShare(
        user1.token,
        message1.messageId,
        'anjay',
        channel2.channelId,
        -1
      )
    ).toStrictEqual(forbidden);
  });

  test('valid input, but the user has not joined the dm they are trying to share the message to', () => {
    const user3 = authRegister(
      'johncena@gmail.com',
      '12345567788',
      'John',
      'Cena'
    );
    const dm2 = dmCreate(user2.token, [user3.authUserId]);
    expect(
      messageShare(user1.token, message1.messageId, 'anjay', -1, dm2.dmId)
    ).toStrictEqual(forbidden);
  });

  test('valid input, share to channel', () => {
    channelInvite(user2.token, channel2.channelId, user1.authUserId);
    expect(
      messageShare(
        user1.token,
        message1.messageId,
        'makan',
        channel2.channelId,
        -1
      )
    ).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(channelMessage(user1.token, channel2.channelId, 0)).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
  });

  test('valid input, share to dm', () => {
    expect(
      messageShare(user1.token, message1.messageId, 'makan', -1, dm1.dmId)
    ).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(dmMessages(user1.token, dm1.dmId, 0)).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
  });
});

describe('testing messagePin in Channels Cases', () => {
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
      messagePinV1('laskdjflkasdfinvalid', message1.messageId)
    ).toStrictEqual(forbidden);
  });
  test('user is not in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    expect(messagePinV1(user2.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });
  test('message does not exist', () => {
    expect(messagePinV1(user1.token, message1.messageId + 200)).toStrictEqual(
      badRequest
    );
  });

  test('message is already pinned', () => {
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual(
      badRequest
    );
  });

  test('global owner can pin message', () => {
    const user2 = authRegister('wego@g.com', 'wego1001', 'Wego', 'Wego');
    const channel2 = channelsCreate(user2.token, 'wego', true);
    channelJoin(user1.token, channel2.channelId);
    const message2 = messageSend(
      user2.token,
      channel2.channelId,
      'test moments'
    );

    expect(messagePinV1(user1.token, message2.messageId)).toStrictEqual({});
  });

  test('channel member cannot pin message', () => {
    const user2 = authRegister('wego@g.com', 'wego1001', 'Wego', 'Wego');
    channelJoin(user2.token, channel1.channelId);

    expect(messagePinV1(user2.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });

  test('pin message and pin message is already pinned', () => {
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual(
      badRequest
    );
  });
  test('pin message', () => {
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(
      channelMessage(user1.token, channel1.channelId, 0).messages[0].isPinned
    ).toStrictEqual(true);
  });
});

describe('testing messagePin in dm Cases', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let dm1: { dmId: number };
  let dm2: { dmId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister(
      'asdwer@gmail.com',
      'welovesoccer1001',
      'Soccer',
      'Boy'
    );
    const uIds1 = [user2.authUserId];
    dm1 = dmCreate(user1.token, uIds1);
    const uIds2 = [user1.authUserId];
    dm2 = dmCreate(user2.token, uIds2);
  });

  afterEach(() => {
    clearV1();
  });

  test('global owner cannot pin message', () => {
    const message1 = messageSendDm(user2.token, dm2.dmId, 'test moments');
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });

  test('pin message and pin message is already pinned', () => {
    const message1 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual(
      badRequest
    );
  });

  test('pin message', () => {
    const message1 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(
      dmMessages(user1.token, dm1.dmId, 0).messages[0].isPinned
    ).toStrictEqual(true);
  });
});

describe('testing messageUnpin in Channels Cases', () => {
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
      messageUnpinV1('laskdjflkasdfinvalid', message1.messageId)
    ).toStrictEqual(forbidden);
  });
  test('user is not in channel', () => {
    const user2 = authRegister(
      'kevinesutandi@gmail.com',
      'lesgo1001',
      'Bevin',
      'Bongo'
    );
    expect(messageUnpinV1(user2.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });
  test('message does not exist', () => {
    expect(messageUnpinV1(user1.token, message1.messageId + 200)).toStrictEqual(
      badRequest
    );
  });

  test('global owner can unpin message', () => {
    const user2 = authRegister('wego@g.com', 'wego1001', 'Wego', 'Wego');
    const channel2 = channelsCreate(user2.token, 'wego', true);
    channelJoin(user1.token, channel2.channelId);
    const message2 = messageSend(
      user2.token,
      channel2.channelId,
      'test moments'
    );
    expect(messagePinV1(user1.token, message2.messageId)).toStrictEqual({});
    expect(messageUnpinV1(user1.token, message2.messageId)).toStrictEqual({});
  });

  test('channel member cannot unpin message', () => {
    const user2 = authRegister('wego@g.com', 'wego1001', 'Wego', 'Wego');
    channelJoin(user2.token, channel1.channelId);
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messageUnpinV1(user2.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });

  test('unpin message and unpin message is already unpinned', () => {
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messageUnpinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messageUnpinV1(user1.token, message1.messageId)).toStrictEqual(
      badRequest
    );
  });
  test('unpin message', () => {
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messageUnpinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(
      channelMessage(user1.token, channel1.channelId, 0).messages[0].isPinned
    ).toStrictEqual(false);
  });
});

describe('testing messageUnpin in dm Cases', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let dm1: { dmId: number };
  let dm2: { dmId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister(
      'asdwer@gmail.com',
      'welovesoccer1001',
      'Soccer',
      'Boy'
    );
    const uIds1 = [user2.authUserId];
    dm1 = dmCreate(user1.token, uIds1);
    const uIds2 = [user1.authUserId];
    dm2 = dmCreate(user2.token, uIds2);
  });

  afterEach(() => {
    clearV1();
  });

  test('global owner cannot pin message', () => {
    const message1 = messageSendDm(user2.token, dm2.dmId, 'test moments');
    messagePinV1(user2.token, message1.messageId);
    expect(messageUnpinV1(user1.token, message1.messageId)).toStrictEqual(
      forbidden
    );
  });

  test('cannot unpin message when not pinned', () => {
    const message1 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(messageUnpinV1(user1.token, message1.messageId)).toStrictEqual(
      badRequest
    );
  });

  test('pin message', () => {
    const message1 = messageSendDm(user1.token, dm1.dmId, 'test moments');
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(
      dmMessages(user1.token, dm1.dmId, 0).messages[0].isPinned
    ).toStrictEqual(true);
    expect(messageUnpinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(
      dmMessages(user1.token, dm1.dmId, 0).messages[0].isPinned
    ).toStrictEqual(false);
  });
});

describe('testing search', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
  });

  afterEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    expect(searchV1('invalidtoken', 'test')).toStrictEqual(forbidden);
  });

  test('queryStr is invalid', () => {
    expect(searchV1(user1.token, '')).toStrictEqual(badRequest);
  });

  test('queryStr is too long', () => {
    expect(searchV1(user1.token, 'a'.repeat(1001))).toStrictEqual(badRequest);
  });

  test('search', () => {
    const user2 = authRegister(
      'asdwer@gmail.com',
      'welovesoccer1001',
      'Soccer',
      'Boy'
    );
    const uIds1 = [user2.authUserId];
    const dm1 = dmCreate(user1.token, uIds1);
    messageSendDm(user1.token, dm1.dmId, 'test moments1');
    messageSendDm(user1.token, dm1.dmId, 'haha moments2');
    const channel1 = channelsCreate(user1.token, 'wego', true);
    messageSend(user1.token, channel1.channelId, 'test moments2');
    messageSend(user1.token, channel1.channelId, 'haha moments2');
    expect(searchV1(user1.token, 'test')).toStrictEqual({
      messages: expect.any(Array),
      start: expect.any(Number),
      end: expect.any(Number),
    });
    expect(searchV1(user1.token, 'test').messages.length).toStrictEqual(2);
  });
});

describe('testing notifications', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel1: { channelId: number };
  let dm1: { dmId: number };

  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister(
      'asdwer@gmail.com',
      'welovesoccer1001',
      'Soccer',
      'Boy'
    );
    channel1 = channelsCreate(user2.token, 'wego', true);
    const uIds1 = [user2.authUserId];
    dm1 = dmCreate(user1.token, uIds1);
  });

  afterEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    expect(notificationsGetV1('invalidtoken')).toStrictEqual(forbidden);
  });

  test('dmCreate user2 should receive notification', () => {
    expect(notificationsGetV1(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage:
            'kevinsutandi added you to kevinsutandi, soccerboy',
        },
      ],
    });
  });

  test('channelInvite user2 should receive notification', () => {
    channelInvite(user2.token, channel1.channelId, user1.authUserId);
    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'soccerboy added you to wego',
        },
      ],
    });
  });

  test('tagged user1 in channel should send notification', () => {
    channelJoin(user1.token, channel1.channelId);
    messageSend(user2.token, channel1.channelId, 'test moments @kevinsutandi');
    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
      ],
    });
  });

  test('tagged both users in channel should send notification', () => {
    channelJoin(user1.token, channel1.channelId);
    messageSend(
      user2.token,
      channel1.channelId,
      'test moments @kevinsutandi @soccerboy'
    );
    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
      ],
    });

    expect(notificationsGetV1(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage:
            'kevinsutandi added you to kevinsutandi, soccerboy',
        },
      ],
    });
  });

  test('tagged both users in channel and one invalid should send notification', () => {
    channelJoin(user1.token, channel1.channelId);
    messageSend(
      user2.token,
      channel1.channelId,
      'test moments @kevinsutandi @soccerboy @randomass'
    );
    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
      ],
    });

    expect(notificationsGetV1(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage:
            'kevinsutandi added you to kevinsutandi, soccerboy',
        },
      ],
    });
  });

  test('tagged both users in channel and one user not in channel (no notif) should send notification', () => {
    channelJoin(user1.token, channel1.channelId);
    authRegister('kev@gm.com', 'kevin1001', 'lmao', 'lmao');
    messageSend(
      user2.token,
      channel1.channelId,
      'test moments @kevinsutandi @soccerboy @lmaolmao'
    );
    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
      ],
    });

    expect(notificationsGetV1(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage:
            'kevinsutandi added you to kevinsutandi, soccerboy',
        },
      ],
    });
  });

  test('multiple tags on same person should only send one notification', () => {
    channelJoin(user1.token, channel1.channelId);
    messageSend(
      user2.token,
      channel1.channelId,
      'test moments @kevinsutandi @kevinsutandi'
    );
    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
      ],
    });
  });

  test('tagged both users in dm should send notification', () => {
    messageSendDm(user2.token, dm1.dmId, '@kevinsutandi @soccerboy @lmaolmao');
    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage:
            'soccerboy tagged you in kevinsutandi, soccerboy: @kevinsutandi @socce',
        },
      ],
    });

    expect(notificationsGetV1(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage:
            'soccerboy tagged you in kevinsutandi, soccerboy: @kevinsutandi @socce',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage:
            'kevinsutandi added you to kevinsutandi, soccerboy',
        },
      ],
    });
  });

  test('mulitple users in dm should send notification', () => {
    const user3 = authRegister('kevin@gmail.com', 'wegoasu1001', 'Wego', 'Asu');
    const uIds1 = [user1.authUserId, user3.authUserId];
    const dm2 = dmCreate(user2.token, uIds1);

    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm2.dmId,
          notificationMessage:
            'soccerboy added you to kevinsutandi, soccerboy, wegoasu',
        },
      ],
    });

    expect(notificationsGetV1(user3.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm2.dmId,
          notificationMessage:
            'soccerboy added you to kevinsutandi, soccerboy, wegoasu',
        },
      ],
    });
  });

  test('tag user if using sendlater and sendlaterdm', async () => {
    authRegister('kevin@gmaillol.com', 'wegoasu1001', 'Wego', 'Asu');

    channelJoin(user1.token, channel1.channelId);

    messageSendLater(
      user2.token,
      channel1.channelId,
      'test moments @kevinsutandi @soccerboy @wegoasu',
      getCurrentTime() + 1
    );

    await sleep(1);

    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
      ],
    });

    const uIds1 = [user1.authUserId];
    const dm1 = dmCreate(user2.token, uIds1);

    messageSendLaterDm(
      user2.token,
      dm1.dmId,
      '@kevinsutandi @soccerboy @wegoasu @soccerboy',
      getCurrentTime() + 1
    );

    await sleep(1);

    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage:
            'soccerboy tagged you in kevinsutandi, soccerboy: @kevinsutandi @socce',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'soccerboy added you to kevinsutandi, soccerboy',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
      ],
    });
  });

  test('tag user when message edited', () => {
    channelJoin(user1.token, channel1.channelId);
    const message1 = messageSend(
      user2.token,
      channel1.channelId,
      'test moments'
    );
    messageEdit(
      user2.token,
      message1.messageId,
      'test moments @kevinsutandi @soccerboy @kevs'
    );
    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage:
            'soccerboy tagged you in wego: test moments @kevins',
        },
      ],
    });
  });

  test('tag user when message edited in Dm', () => {
    const dm = dmCreate(user2.token, [user1.authUserId]);
    const message1 = messageSendDm(user2.token, dm.dmId, 'test moments');
    messageEdit(
      user2.token,
      message1.messageId,
      'test moments @kevinsutandi @soccerboy @kevs'
    );
    expect(notificationsGetV1(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage:
            'soccerboy tagged you in kevinsutandi, soccerboy: test moments @kevins',
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'soccerboy added you to kevinsutandi, soccerboy',
        },
      ],
    });
  });
});

describe('testing message react', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel1: { channelId: number };
  // let channel2: { channelId: number };
  let message1: newMessageReturn;
  let message2: newMessageReturn;
  let dm1: dmCreateReturn;

  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister(
      'asdwer@gmail.com',
      'welovesoccer1001',
      'Soccer',
      'Boy'
    );
    channel1 = channelsCreate(user1.token, 'wego', true);
    // channel2 = channelsCreate(user2.token, 'memes', false);
    dm1 = dmCreate(user1.token, [user2.authUserId]);
    message1 = messageSend(user1.token, channel1.channelId, 'HAPPY');
    message2 = messageSendDm(user1.token, dm1.dmId, 'FACE');
  });

  afterEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    expect(messageReact(user1.token + 2, message1.messageId, 1)).toBe(403);
  });

  test('messageId is invalid', () => {
    expect(messageReact(user1.token, message1.messageId + 1, 1)).toBe(400);
  });

  test('reactId is invalid', () => {
    expect(messageReact(user1.token, message1.messageId, 3)).toBe(400);
  });

  test('user is not a member of the channel', () => {
    expect(messageReact(user2.token, message1.messageId, 1)).toBe(403);
  });

  // message already contained the react that sent from the authorised user
  //
  test('react already sent', () => {
    expect(messageReact(user1.token, message1.messageId, 1)).toStrictEqual({});
    expect(messageReact(user1.token, message1.messageId, 1)).toBe(400);
    expect(messageReact(user1.token, message2.messageId, 1)).toStrictEqual({});
    expect(messageReact(user1.token, message2.messageId, 1)).toBe(400);
  });

  test('valid case', () => {
    expect(messageReact(user1.token, message1.messageId, 1)).toStrictEqual({});
    const check1 = channelMessage(user1.token, channel1.channelId, 0);
    expect(check1).toStrictEqual({
      messages: [
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'HAPPY',
          timeSent: NUM,
          isPinned: false,
          reacts: [
            {
              isThisUserReacted: true,
              reactId: 1,
              uIds: [user1.authUserId],
            },
          ],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('valid case for dm', () => {
    expect(messageReact(user2.token, message2.messageId, 1)).toStrictEqual({});
    const check2 = dmMessages(user2.token, dm1.dmId, 0);

    expect(check2).toStrictEqual({
      messages: [
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'FACE',
          timeSent: NUM,
          isPinned: false,
          reacts: [
            {
              isThisUserReacted: true,
              reactId: 1,
              uIds: [user2.authUserId],
            },
          ],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('valid case where 2 users react', () => {
    channelJoin(user2.token, channel1.channelId);
    expect(messageReact(user1.token, message1.messageId, 1)).toStrictEqual({});
    expect(messageReact(user2.token, message1.messageId, 1)).toStrictEqual({});
    expect(messageReact(user1.token, message2.messageId, 1)).toStrictEqual({});
    expect(messageReact(user2.token, message2.messageId, 1)).toStrictEqual({});
    const check1 = channelMessage(user1.token, channel1.channelId, 0);
    const check2 = dmMessages(user2.token, dm1.dmId, 0);
    expect(check1).toStrictEqual({
      messages: [
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'HAPPY',
          timeSent: NUM,
          isPinned: false,
          reacts: [
            {
              isThisUserReacted: true,
              reactId: 1,
              uIds: [user1.authUserId, user2.authUserId],
            },
          ],
        },
      ],
      start: 0,
      end: -1,
    });
    expect(check2).toStrictEqual({
      messages: [
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'FACE',
          timeSent: NUM,
          isPinned: false,
          reacts: [
            {
              isThisUserReacted: true,
              reactId: 1,
              uIds: [user1.authUserId, user2.authUserId],
            },
          ],
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('testing message unreact', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel1: { channelId: number };
  // let channel2: { channelId: number };
  let message1: newMessageReturn;
  let message2: newMessageReturn;
  let dm1: dmCreateReturn;

  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister(
      'asdwer@gmail.com',
      'welovesoccer1001',
      'Soccer',
      'Boy'
    );
    channel1 = channelsCreate(user1.token, 'wego', true);
    // channel2 = channelsCreate(user2.token, 'memes', false);
    dm1 = dmCreate(user1.token, [user2.authUserId]);
    message1 = messageSend(user1.token, channel1.channelId, 'HAPPY');
    message2 = messageSendDm(user1.token, dm1.dmId, 'FACE');
  });

  afterEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    expect(messageUnReact(user1.token + 2, message1.messageId, 1)).toBe(403);
  });

  test('messageId is invalid', () => {
    expect(messageUnReact(user1.token, message1.messageId + 1, 1)).toBe(400);
  });

  test('reactId is invalid', () => {
    expect(messageUnReact(user1.token, message1.messageId, 3)).toBe(400);
  });

  test('message does not contain that react', () => {
    expect(messageUnReact(user1.token, message1.messageId, 1)).toBe(400);
    expect(messageUnReact(user1.token, message2.messageId, 1)).toBe(400);
  });

  test('user is not in the channel', () => {
    const user3: AuthReturn = authRegister(
      'kev@gm.com',
      'kevin1001',
      'Kevin',
      'sadkfjlksajd'
    );
    messageReact(user2.token, message1.messageId, 1);
    expect(messageUnReact(user3.token, message1.messageId, 1)).toBe(403);
  });

  test('user is not in the dm', () => {
    const user3: AuthReturn = authRegister(
      'kev@gm.com',
      'kevin1001',
      'Kevin',
      'sadkfjlksajd'
    );
    messageReact(user2.token, message2.messageId, 1);
    expect(messageUnReact(user3.token, message2.messageId, 1)).toBe(403);
  });

  test('user has not reacted to the message', () => {
    channelJoin(user2.token, channel1.channelId);
    messageReact(user2.token, message1.messageId, 1);
    expect(messageUnReact(user1.token, message1.messageId, 1)).toBe(400);
  });

  test('user has not reacted in dm', () => {
    messageReact(user2.token, message2.messageId, 1);
    expect(messageUnReact(user1.token, message2.messageId, 1)).toBe(400);
  });

  test('valid case for channel', () => {
    messageReact(user1.token, message1.messageId, 1);
    expect(messageUnReact(user1.token, message1.messageId, 1)).toStrictEqual(
      {}
    );
    const check1 = channelMessage(user1.token, channel1.channelId, 0);
    expect(check1).toStrictEqual({
      messages: [
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'HAPPY',
          timeSent: NUM,
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('valid case for dm', () => {
    messageReact(user2.token, message2.messageId, 1);
    expect(messageUnReact(user2.token, message2.messageId, 1)).toStrictEqual(
      {}
    );
    const check2 = dmMessages(user2.token, dm1.dmId, 0);
    expect(check2).toStrictEqual({
      messages: [
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'FACE',
          timeSent: NUM,
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('valid case for dm 2', () => {
    messageReact(user2.token, message2.messageId, 1);
    messageReact(user1.token, message2.messageId, 1);
    expect(messageUnReact(user2.token, message2.messageId, 1)).toStrictEqual(
      {}
    );
    const check2 = dmMessages(user2.token, dm1.dmId, 0);
    expect(check2).toStrictEqual({
      messages: [
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'FACE',
          timeSent: NUM,
          isPinned: false,
          reacts: [
            {
              isThisUserReacted: false,
              reactId: 1,
              uIds: [user1.authUserId],
            },
          ],
        },
      ],
      start: 0,
      end: -1,
    });
    expect(messageUnReact(user1.token, message2.messageId, 1)).toStrictEqual(
      {}
    );
    const check3 = dmMessages(user2.token, dm1.dmId, 0);
    expect(check3).toStrictEqual({
      messages: [
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'FACE',
          timeSent: NUM,
          isPinned: false,

          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });
});
