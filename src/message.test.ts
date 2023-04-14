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
  channelInvite,
} from './httpHelper';
import { AuthReturn } from './interfaces';

const badrequest = 400;
const forbidden = 403;

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
    ).toStrictEqual(badrequest);
  });

  test('length of message is below 1 character', () => {
    expect(messageSend(user1.token, channel1.channelId, '')).toStrictEqual(
      badrequest
    );
  });

  test('length of message is above 1000 characters', () => {
    const message = 'a'.repeat(1001);
    expect(messageSend(user1.token, channel1.channelId, message)).toStrictEqual(
      badrequest
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
        reacts: [
          {
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          },
        ],
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
      badrequest
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
    expect(messageRemove(user1.token, 100000)).toStrictEqual(badrequest);
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
    ).toStrictEqual(badrequest);
  });

  test('message length over 1000', () => {
    expect(
      messageEdit(user1.token, message1.messageId, 'a'.repeat(1001))
    ).toStrictEqual(badrequest);
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
    ).toStrictEqual(badrequest);
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
          reacts: [
            {
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            },
          ],
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
          reacts: [
            {
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            },
          ],
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
          reacts: [
            {
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            },
          ],
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
    expect(messageEdit(user1.token, 100000, 'hello')).toStrictEqual(badrequest);
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
          reacts: [
            {
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            },
          ],
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
          reacts: [
            {
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            },
          ],
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
    ).toStrictEqual(badrequest);
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
      badrequest
    );
  });

  test('invalid token', () => {
    expect(
      messageSendDm('abnomrklasdjflk', dm1.dmId, 'hello world')
    ).toStrictEqual(forbidden);
  });

  test('invalid messages', () => {
    expect(messageSendDm(user1.token, dm1.dmId, '')).toStrictEqual(badrequest);
    expect(
      messageSendDm(user1.token, dm1.dmId, 'a'.repeat(1001))
    ).toStrictEqual(badrequest);
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
    ).toStrictEqual(badrequest);
  });

  test('length of message is below 1 character', () => {
    expect(
      messageSendLater(user1.token, channel1.channelId, '', sendTime + 2000)
    ).toStrictEqual(badrequest);
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
    ).toStrictEqual(badrequest);
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
    ).toStrictEqual(badrequest);
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
      badrequest
    );
  });
  test('pin message and pin message is already pinned', () => {
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual(
      badrequest
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
      badrequest
    );
  });
  test('unpin message and unpin message is already unpinned', () => {
    expect(messagePinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messageUnpinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(messageUnpinV1(user1.token, message1.messageId)).toStrictEqual(
      badrequest
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
    expect(searchV1(user1.token, '')).toStrictEqual(badrequest);
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
    const channel1 = channelsCreate(user1.token, 'wego', true);
    messageSend(user1.token, channel1.channelId, 'test moments2');
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

  // afterEach(() => {
  //   clearV1();
  // });

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
});
