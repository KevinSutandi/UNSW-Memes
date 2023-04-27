import {
  authRegister,
  clearV1,
  channelsCreate,
  channelMessage,
  channelDetails,
  channelInvite,
  channelJoin,
  channelLeave,
  channelAddOwner,
  channelRemoveOwner,
  messageSend,
} from '../httpHelper';
import {
  AuthReturn,
  channelsCreateReturn,
  messagesObject,
} from '../interfaces';
import { badRequest, forbidden } from '../functionHelper';

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

  afterEach(() => {
    clearV1();
  });

  test('channelId does not exist test', () => {
    expect(channelMessage(user1.token, channel1.channelId + 100000, 0)).toBe(
      badRequest
    );
  });
  test('token does not exist test', () => {
    expect(channelMessage(user3.token + 999, channel3.channelId, 0)).toBe(
      forbidden
    );
  });
  test('User is not in channel (cannot read messages)', () => {
    expect(channelMessage(user3.token, channel2.channelId, 0)).toStrictEqual(
      forbidden
    );
  });
  test('start index is greater than the number of messages', () => {
    expect(
      channelMessage(user2.token, channel2.channelId, 999999)
    ).toStrictEqual(badRequest);
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
    const messageIds: messagesObject[] = [];
    for (let i = 0; i < 30; i++) {
      messageIds[i] = messageSend(
        user1.token,
        channel1.channelId,
        `hello ${i}`
      );
    }

    messageIds.reverse();

    const result = channelMessage(user1.token, channel1.channelId, 0);
    const numMessages = result.messages.length;
    for (let i = 0; i < numMessages; i++) {
      expect(result.messages[i].messageId).toBe(messageIds[i].messageId);
    }
    expect(result).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
    expect(numMessages).toBe(30);
  });

  test('more than 50 messages in the channel', () => {
    const messageIds: messagesObject[] = [];
    for (let i = 0; i < 60; i++) {
      messageIds[i] = messageSend(
        user1.token,
        channel1.channelId,
        `hello shin ${i}`
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
    for (let i = 0; i < 50; i++) {
      expect(result.messages[i].messageId).toStrictEqual(
        messageIds[i].messageId
      );
    }
    expect(numMessages).toBe(50);
    for (let i = 50; i < 60; i++) {
      expect(result2.messages[i - 50].messageId).toStrictEqual(
        messageIds[i].messageId
      );
    }
    expect(result2).toStrictEqual({
      messages: expect.any(Array),
      start: 50,
      end: -1,
    });
    expect(numMessages2).toBe(10);
  });
});

describe('/channel/details/v3', () => {
  let user: AuthReturn, user2: AuthReturn;
  let channel: channelsCreateReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
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
    channel = channelsCreate(user.token, 'general', true);
  });

  afterEach(() => {
    clearV1();
  });

  test('invalid channelId', () => {
    expect(channelDetails(user.token, channel.channelId + 1)).toEqual(
      badRequest
    );
  });

  test('valid token, user is not a member', () => {
    expect(channelDetails(user2.token, channel.channelId)).toEqual(forbidden);
  });

  test('invalid token', () => {
    expect(channelDetails('asade', channel.channelId)).toEqual(forbidden);
  });

  test('valid input', () => {
    expect(channelDetails(user.token, channel.channelId)).toStrictEqual({
      name: 'general',
      isPublic: true,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});

// push test first please
// given channel id and token, authorised users can join this channel

describe('testing channelJoinV2', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let user3: AuthReturn;
  let channel1: channelsCreateReturn;
  let channel2: channelsCreateReturn;
  let channel3: channelsCreateReturn;
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
    channel1 = channelsCreate(user1.token, 'Ketoprak', true);
    channel2 = channelsCreate(user2.token, 'Bakso', true);
    channel3 = channelsCreate(user3.token, 'Batagor', false);
  });

  afterEach(() => {
    clearV1();
  });

  test('channelId does not exist test 1', () => {
    expect(channelJoin(user1.token, channel2.channelId + 5)).toBe(badRequest);
  });
  test('channelId does not exist test 2', () => {
    expect(channelJoin(user3.token, channel2.channelId + 3)).toBe(badRequest);
  });
  test('invalid token test 1', () => {
    expect(channelJoin(user1.token + 4, channel3.channelId)).toBe(forbidden);
  });
  test('invalid token test 2', () => {
    expect(channelJoin(user3.token + 10, channel2.channelId)).toBe(forbidden);
  });
  test('authUserId already in channel test 1', () => {
    expect(channelJoin(user1.token, channel1.channelId)).toStrictEqual(
      badRequest
    );
  });
  test('authUserId already in channel test 2', () => {
    expect(channelJoin(user2.token, channel2.channelId)).toBe(badRequest);
  });
  test('channel is private while non gloabalOwner is joining', () => {
    expect(channelJoin(user2.token, channel3.channelId)).toBe(forbidden);
  });
  test('channel is private while globalOwner is joining', () => {
    channelJoin(user1.token, channel3.channelId);
    expect(channelDetails(user1.token, channel3.channelId)).toStrictEqual({
      name: 'Batagor',
      isPublic: false,
      ownerMembers: [
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('Join channel test 1', () => {
    channelJoin(user3.token, channel1.channelId);
    expect(channelDetails(user3.token, channel1.channelId)).toStrictEqual({
      name: 'Ketoprak',
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
  test('Join channel test 2', () => {
    channelJoin(user1.token, channel2.channelId);
    expect(channelDetails(user1.token, channel2.channelId)).toStrictEqual({
      name: 'Bakso',
      isPublic: true,
      ownerMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});

// push the test first
// invalid channelid;
// invalid token;
// user is not the member of the channel
// valid cases: the only user leaves the channel;
//              leaving one by one
// details to check if the user is not member anymore but teh information still will be in the channel
describe('testing channelLeaveV1', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let user3: AuthReturn;
  let channel1: channelsCreateReturn;
  let channel2: channelsCreateReturn;
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
    channel1 = channelsCreate(user1.token, 'Ketoprak', true);
    channel2 = channelsCreate(user2.token, 'Bakso', true);
  });

  afterEach(() => {
    clearV1();
  });

  test('Invalid channelId test 1', () => {
    expect(channelLeave(user2.token, channel2.channelId + 10)).toBe(badRequest);
  });

  test('Invalid channelId test 2', () => {
    expect(channelLeave(user1.token, channel1.channelId + 3)).toBe(badRequest);
  });

  test('invalid token test 1', () => {
    expect(channelLeave(user1.token + 10, channel1.channelId)).toBe(forbidden);
  });

  test('invalid token test 2', () => {
    expect(channelLeave(user2.token + 1, channel2.channelId)).toBe(forbidden);
  });

  test('authorised user is not member test 1', () => {
    expect(channelLeave(user1.token, channel2.channelId)).toBe(forbidden);
  });

  test('authorised user is not member test 2', () => {
    expect(channelLeave(user3.token, channel2.channelId)).toBe(forbidden);
  });

  test('The only owner leaving test, no longer member', () => {
    channelLeave(user1.token, channel1.channelId);
    expect(channelDetails(user1.token, channel1.channelId)).toBe(forbidden);
  });

  test('One of the users leave test, no longer member', () => {
    channelJoin(user2.token, channel1.channelId);
    channelLeave(user2.token, channel1.channelId);
    expect(channelDetails(user2.token, channel1.channelId)).toBe(forbidden);
  });

  test('One of the users leave test, but information stay remain', () => {
    channelJoin(user2.token, channel1.channelId);
    channelLeave(user2.token, channel1.channelId);
    // user1 and user2 information without user2.authuserid
    expect(channelDetails(user1.token, channel1.channelId)).toStrictEqual({
      name: 'Ketoprak',
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('Owner leave, but information stay remain', () => {
    channelJoin(user2.token, channel1.channelId);
    channelLeave(user1.token, channel1.channelId);
    // user1 and user2 information without user1.authuserid
    expect(channelDetails(user2.token, channel1.channelId)).toStrictEqual({
      name: 'Ketoprak',
      isPublic: true,
      ownerMembers: [],
      allMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  // everyone leaves test might be added
});

// push the test please
// 6 errors
// invalid channel;token; invalid uId; user with uId is not member
// the member with uid is already owner
// channelid is valid and user is member but user has no owner permission
describe('testing channelAddowner', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let user3: AuthReturn;
  let channel1: channelsCreateReturn;
  let channel2: channelsCreateReturn;
  let channel3: channelsCreateReturn;

  beforeEach(() => {
    clearV1();
    // user1 is the global owner
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
    channel1 = channelsCreate(user1.token, 'Ketoprak', true);
    channel2 = channelsCreate(user2.token, 'Bakso', true);
    channel3 = channelsCreate(user3.token, 'Batagor', true);
  });

  afterEach(() => {
    clearV1();
  });

  test('Invalid channelId test 1', () => {
    expect(
      channelAddOwner(user2.token, channel2.channelId + 10, user1.authUserId)
    ).toBe(badRequest);
  });

  test('Invalid channelId test 2', () => {
    expect(
      channelAddOwner(user1.token, channel1.channelId + 3, user2.authUserId)
    ).toBe(badRequest);
  });

  test('invalid token test 1', () => {
    expect(
      channelAddOwner(user1.token + 10, channel1.channelId, user2.authUserId)
    ).toBe(forbidden);
  });

  test('invalid token test 2', () => {
    expect(
      channelAddOwner(user2.token + 1, channel2.channelId, user1.authUserId)
    ).toBe(forbidden);
  });

  test('invalid uId test 1', () => {
    expect(
      channelAddOwner(user1.token, channel1.channelId, user2.authUserId + 10)
    ).toBe(badRequest);
  });

  test('invalid uID test 2', () => {
    expect(
      channelAddOwner(user2.token, channel2.channelId, user1.authUserId + 6)
    ).toBe(badRequest);
  });

  test('user not member test 1', () => {
    expect(
      channelAddOwner(user3.token, channel1.channelId, user2.authUserId)
    ).toBe(badRequest);
  });

  test('user not member test 2', () => {
    expect(
      channelAddOwner(user2.token, channel2.channelId, user3.authUserId)
    ).toBe(badRequest);
  });

  test('user executing command is not in channel test 1', () => {
    channelJoin(user2.token, channel1.channelId);
    expect(
      channelAddOwner(user3.token, channel1.channelId, user2.authUserId)
    ).toBe(forbidden);
  });

  test('user already is owner test 1', () => {
    expect(
      channelAddOwner(user1.token, channel1.channelId, user1.authUserId)
    ).toBe(badRequest);
  });

  test('user already is owner test 2', () => {
    expect(
      channelAddOwner(user2.token, channel2.channelId, user2.authUserId)
    ).toBe(badRequest);
  });

  test('user has no permission test 1', () => {
    // not owner and not global
    channelJoin(user2.token, channel1.channelId);
    channelJoin(user3.token, channel1.channelId);
    expect(
      channelAddOwner(user2.token, channel1.channelId, user3.authUserId)
    ).toBe(forbidden);
  });

  test('user has no permission test 2', () => {
    channelJoin(user1.token, channel2.channelId);
    channelJoin(user3.token, channel2.channelId);
    expect(
      channelAddOwner(user3.token, channel2.channelId, user1.authUserId)
    ).toBe(forbidden);
  });

  test('testing user1 is global owner', () => {
    // user1 makes user2 the owner of the channel3
    channelJoin(user1.token, channel3.channelId);
    channelJoin(user2.token, channel3.channelId);
    channelAddOwner(user1.token, channel3.channelId, user2.authUserId);
    expect(channelDetails(user2.token, channel3.channelId)).toStrictEqual({
      name: 'Batagor',
      isPublic: true,
      ownerMembers: [
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('channel owner adds others test', () => {
    // user2 makes user3 the owner of the channel2
    channelJoin(user3.token, channel2.channelId);
    channelAddOwner(user2.token, channel2.channelId, user3.authUserId);
    expect(channelDetails(user3.token, channel2.channelId)).toStrictEqual({
      name: 'Bakso',
      isPublic: true,
      ownerMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});

describe('/channel/invite/v3', () => {
  let user1: AuthReturn, user2: AuthReturn, user3: AuthReturn;
  let channel1: channelsCreateReturn,
    channel2: channelsCreateReturn,
    channel3: channelsCreateReturn;
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
    channel1 = channelsCreate(user1.token, 'Ketoprak', true);
    channel2 = channelsCreate(user2.token, 'Bakso', true);
    channel3 = channelsCreate(user3.token, 'Batagor', false);
  });
  test('channelId does not exist test 1', () => {
    expect(
      channelInvite(user1.token, channel1.channelId + 5, user2.authUserId)
    ).toEqual(badRequest);
  });
  test('channelId does not exist test 2', () => {
    expect(
      channelInvite(user3.token, channel3.channelId + 3, user3.authUserId)
    ).toEqual(badRequest);
  });
  test('invalid token test 1', () => {
    expect(
      channelInvite('user1.token + 4', channel3.channelId, user2.authUserId)
    ).toEqual(forbidden);
  });
  test('invalid token test 2', () => {
    expect(
      channelInvite('user3.token + 10', channel2.channelId, user1.authUserId)
    ).toEqual(forbidden);
  });
  test('invalid token test 3', () => {
    expect(
      channelInvite('user3.token', channel2.channelId, user1.authUserId + 99)
    ).toEqual(forbidden);
  });
  test('person invited does not exist test 1', () => {
    expect(
      channelInvite(user1.token, channel1.channelId, user2.authUserId + 99)
    ).toEqual(badRequest);
  });
  test('person invited does not exist test 2', () => {
    expect(
      channelInvite(user3.token, channel3.channelId, user1.authUserId + 99)
    ).toEqual(badRequest);
  });
  test('person invited already in channel test 1', () => {
    channelJoin(user2.token, channel1.channelId);
    expect(
      channelInvite(user1.token, channel1.channelId, user2.authUserId)
    ).toEqual(badRequest);
  });
  test('person invited already in channel test 2', () => {
    channelJoin(user1.token, channel2.channelId);
    channelJoin(user3.token, channel2.channelId);
    expect(
      channelInvite(user2.token, channel2.channelId, user3.authUserId)
    ).toEqual(badRequest);
  });
  test('person inviting is not in channel test 1', () => {
    expect(
      channelInvite(user1.token, channel2.channelId, user3.authUserId)
    ).toEqual(forbidden);
  });
  test('person inviting is not in channel test 2', () => {
    expect(
      channelInvite(user3.token, channel2.channelId, user1.authUserId)
    ).toEqual(forbidden);
  });
  test('Invite person to channel test 1', () => {
    channelInvite(user1.token, channel1.channelId, user3.authUserId);
    expect(channelDetails(user1.token, channel1.channelId)).toStrictEqual({
      name: 'Ketoprak',
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
  test('Join channel test 2', () => {
    channelInvite(user2.token, channel2.channelId, user1.authUserId);
    expect(channelDetails(user2.token, channel2.channelId)).toStrictEqual({
      name: 'Bakso',
      isPublic: true,
      ownerMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});

// push test first
// 6 errors
describe('testing removing owner from channel', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let user3: AuthReturn;
  let channel1: channelsCreateReturn;
  let channel2: channelsCreateReturn;
  let channel3: channelsCreateReturn;
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
    channel1 = channelsCreate(user1.token, 'Ketoprak', true);
    channel2 = channelsCreate(user2.token, 'Bakso', true);
    channel3 = channelsCreate(user3.token, 'Batagor', false);
  });

  afterEach(() => {
    clearV1();
  });

  test('Invalid channelId test 1', () => {
    expect(
      channelRemoveOwner(user2.token, channel2.channelId + 10, user2.authUserId)
    ).toBe(badRequest);
  });

  test('Invalid channelId test 2', () => {
    expect(
      channelRemoveOwner(user1.token, channel1.channelId + 3, user2.authUserId)
    ).toBe(badRequest);
  });

  test('Invalid uId test 1', () => {
    expect(
      channelRemoveOwner(user2.token, channel2.channelId, user2.authUserId + 2)
    ).toBe(badRequest);
  });

  test('Invalid uId test 2', () => {
    expect(
      channelRemoveOwner(user1.token, channel1.channelId, user2.authUserId + 8)
    ).toBe(badRequest);
  });

  test('Invalid token test 1', () => {
    expect(
      channelRemoveOwner(user2.token + 1, channel2.channelId, user2.authUserId)
    ).toBe(forbidden);
  });

  test('Invalid token test 2', () => {
    expect(
      channelRemoveOwner(user1.token + 2, channel1.channelId, user2.authUserId)
    ).toBe(forbidden);
  });

  test('user executing command is not in channel test 1', () => {
    channelJoin(user2.token, channel1.channelId);
    expect(
      channelRemoveOwner(user3.token, channel1.channelId, user2.authUserId)
    ).toBe(forbidden);
  });

  test('User with uId is not owner test 1', () => {
    channelJoin(user1.token, channel3.channelId);
    channelJoin(user2.token, channel3.channelId);
    expect(
      channelRemoveOwner(user3.token, channel3.channelId, user2.authUserId)
    ).toBe(badRequest);
  });

  test('User with uId is not owner test 2', () => {
    channelJoin(user1.token, channel3.channelId);
    channelJoin(user2.token, channel3.channelId);
    expect(
      channelRemoveOwner(user1.token, channel2.channelId, user3.authUserId)
    ).toBe(badRequest);
  });

  test('Global owner with uId is not owner test 2', () => {
    channelJoin(user1.token, channel2.channelId);
    channelJoin(user3.token, channel2.channelId);
    expect(
      channelRemoveOwner(user2.token, channel2.channelId, user1.authUserId)
    ).toBe(badRequest);
  });

  // global owner has the owner permission to remove other owner(who is not the only owner)
  // when if they are removed as global owner, not channel owner as well, then without owner permission
  test('User with token does not have owner permission test 1', () => {
    expect(
      channelRemoveOwner(user2.token, channel3.channelId, user3.authUserId)
    ).toBe(forbidden);
  });

  test('User with token does not have owner permission test 2', () => {
    expect(
      channelRemoveOwner(user2.token, channel3.channelId, user3.authUserId)
    ).toBe(forbidden);
  });

  test('User with uId is the only owner test 1', () => {
    expect(
      channelRemoveOwner(user2.token, channel2.channelId, user2.authUserId)
    ).toBe(badRequest);
  });

  test('channel member removes  owner test', () => {
    channelJoin(user1.token, channel2.channelId);
    channelJoin(user3.token, channel2.channelId);
    channelAddOwner(user2.token, channel2.channelId, user1.authUserId);
    expect(
      channelRemoveOwner(user3.token, channel2.channelId, user2.authUserId)
    ).toBe(forbidden);
  });

  test('User with uId is the only owner test 2', () => {
    expect(
      channelRemoveOwner(user3.token, channel3.channelId, user3.authUserId)
    ).toBe(badRequest);
  });

  test('Global owner removes the only owner test 3', () => {
    channelJoin(user1.token, channel2.channelId);
    expect(
      channelRemoveOwner(user1.token, channel2.channelId, user2.authUserId)
    ).toBe(badRequest);
  });

  test('channel owner removes the other owner test 1', () => {
    channelJoin(user3.token, channel2.channelId);
    channelAddOwner(user2.token, channel2.channelId, user3.authUserId);
    channelRemoveOwner(user3.token, channel2.channelId, user2.authUserId);
    // user2 no longer the owner of channel2
    expect(channelDetails(user3.token, channel2.channelId)).toStrictEqual({
      name: 'Bakso',
      isPublic: true,
      ownerMembers: [
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('global owner removes the other owner test', () => {
    channelJoin(user1.token, channel2.channelId);
    channelJoin(user3.token, channel2.channelId);
    channelAddOwner(user2.token, channel2.channelId, user3.authUserId);
    channelRemoveOwner(user1.token, channel2.channelId, user3.authUserId);
    // user3 no longer the owner of channel2
    expect(channelDetails(user2.token, channel2.channelId)).toStrictEqual({
      name: 'Bakso',
      isPublic: true,
      ownerMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});
