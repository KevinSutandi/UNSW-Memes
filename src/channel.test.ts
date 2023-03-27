import {
  authRegister,
  clearV1,
  channelsCreate,
  channelMessage,
  channelDetails,
  channelInvite,
} from './httpHelper';
import { AuthReturn, channelsCreateReturn } from './interfaces';

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

/*
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
*/

describe('/channel/details/v2', () => {
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

  test('invalid token', () => {
    expect(channelDetails(user.token, channel.channelId + 1)).toStrictEqual(
      ERROR
    );
  });

  test('valid token, user is not a member', () => {
    expect(channelDetails(user2.token, channel.channelId)).toStrictEqual(ERROR);
  });

  test('invalid token', () => {
    expect(channelDetails('asade', channel.channelId)).toStrictEqual(ERROR);
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
        },
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
        },
      ],
    });
  });
});

/*
describe('testing channelJoinV1', () => {
  let user1, user2, user3;
  let channel1, channel2, channel3;
  beforeEach(() => {
    clearV1();
    user1 = authRegisterV1(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegisterV1(
      'someotheremail@gmail.com',
      'someone2031',
      'Jonah',
      'Meggs'
    );
    user3 = authRegisterV1(
      'z5352065@ad.unsw.edu.au',
      'big!password3',
      'Zombie',
      'Ibrahim'
    );
    channel1 = channelsCreateV1(user1.token, 'Ketoprak', true);
    channel2 = channelsCreateV1(user2.token, 'Bakso', true);
    channel3 = channelsCreateV1(user3.token, 'Batagor', false);
  });
  test('channelId does not exist test 1', () => {
    expect(
      channelJoinV1(user1.token, channel2.channelId + 5)
    ).toStrictEqual(ERROR);
  });
  test('channelId does not exist test 2', () => {
    expect(
      channelJoinV1(user3.token, channel2.channelId + 3)
    ).toStrictEqual(ERROR);
  });
  test('invalid token test 1', () => {
    expect(
      channelJoinV1(user1.token + 4, channel3.channelId)
    ).toStrictEqual(ERROR);
  });
  test('invalid token test 2', () => {
    expect(
      channelJoinV1(user3.token + 10, channel2.channelId)
    ).toStrictEqual(ERROR);
  });
  test('token already in channel test 1', () => {
    expect(channelJoinV1(user1.token, channel1.channelId)).toStrictEqual(
      ERROR
    );
  });
  test('token already in channel test 2', () => {
    expect(channelJoinV1(user2.token, channel2.channelId)).toStrictEqual(
      ERROR
    );
  });
  test('channel is private while non gloabalOwner is joining', () => {
    expect(channelJoinV1(user2.token, channel3.channelId)).toStrictEqual(
      ERROR
    );
  });
  test('channel is private while globalOwner is joining', () => {
    channelJoinV1(user1.token, channel3.channelId);
    expect(
      channelDetailsV1(user1.token, channel3.channelId)
    ).toStrictEqual({
      name: 'Batagor',
      isPublic: false,
      ownerMembers: [
        {
          uId: user3.token,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
        },
      ],
      allMembers: [
        {
          uId: user3.token,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
        },
        {
          uId: user1.token,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
        },
      ],
    });
  });

  test('Join channel test 1', () => {
    channelJoinV1(user3.token, channel1.channelId);
    expect(
      channelDetailsV1(user3.token, channel1.channelId)
    ).toStrictEqual({
      name: 'Ketoprak',
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.token,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
        },
      ],
      allMembers: [
        {
          uId: user1.token,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
        },
        {
          uId: user3.token,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
        },
      ],
    });
  });
  test('Join channel test 2', () => {
    channelJoinV1(user1.token, channel2.channelId);
    expect(
      channelDetailsV1(user1.token, channel2.channelId)
    ).toStrictEqual({
      name: 'Bakso',
      isPublic: true,
      ownerMembers: [
        {
          uId: user2.token,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
        },
      ],
      allMembers: [
        {
          uId: user2.token,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
        },
        {
          uId: user1.token,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
        },
      ],
    });
  });
});
*/
describe('/channel/invite/v2', () => {
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
    ).toStrictEqual(ERROR);
  });
  test('channelId does not exist test 2', () => {
    expect(
      channelInvite(user3.token, channel3.channelId + 3, user3.authUserId)
    ).toStrictEqual(ERROR);
  });
  test('invalid token test 1', () => {
    expect(
      channelInvite('user1.token + 4', channel3.channelId, user2.authUserId)
    ).toStrictEqual(ERROR);
  });
  test('invalid token test 2', () => {
    expect(
      channelInvite('user3.token + 10', channel2.channelId, user1.authUserId)
    ).toStrictEqual(ERROR);
  });
  test('invalid token test 3', () => {
    expect(
      channelInvite(user3.token, channel2.channelId, user1.authUserId + 99)
    ).toStrictEqual(ERROR);
  });
  test('person invited does not exist test 1', () => {
    expect(
      channelInvite(user1.token, channel1.channelId, user2.authUserId + 99)
    ).toStrictEqual(ERROR);
  });
  test('person invited does not exist test 2', () => {
    expect(
      channelInvite(user3.token, channel3.channelId, user1.authUserId + 99)
    ).toStrictEqual(ERROR);
  });
  // test('person invited already in channel test 1', () => {
  //   channelJoinV1(user2.token, channel1.channelId);
  //   expect(
  //     channelJoinV1(user1.token, channel1.channelId, user2.token)
  //   ).toStrictEqual(ERROR);
  // });
  // test('person invited already in channel test 2', () => {
  //   channelJoinV1(user1.token, channel2.channelId);
  //   channelJoinV1(user3.token, channel2.channelId);
  //   expect(
  //     channelInvite(user2.token, channel2.channelId, user3.token)
  //   ).toStrictEqual(ERROR);
  // });
  test('person inviting is not in channel test 1', () => {
    expect(
      channelInvite(user1.token, channel2.channelId, user3.authUserId)
    ).toStrictEqual(ERROR);
  });
  test('person inviting is not in channel test 2', () => {
    expect(
      channelInvite(user3.token, channel2.channelId, user1.authUserId)
    ).toStrictEqual(ERROR);
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
        },
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
        },
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
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
        },
      ],
      allMembers: [
        {
          uId: user2.authUserId,
          email: 'someotheremail@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
        },
        {
          uId: user1.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi',
        },
      ],
    });
  });
});
