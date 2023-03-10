import { authRegisterV1 } from './auth.js';

import { channelsCreateV1 } from './channels.js';

import {
  channelJoinV1,
  channelInviteV1,
  channelMessagesV1,
  channelDetailsV1,
} from './channel.js';

import { clearV1 } from './other.js';

const ERROR = { error: expect.any(String) };

describe('channelDetailsV1 Iteration 1 tests', () => {
  let user, user2;
  let channel;
  beforeEach(() => {
    clearV1();
    user = authRegisterV1(
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
    channel = channelsCreateV1(user.authUserId, 'general', true);
  });

  test('invalid channelId', () => {
    expect(
      channelDetailsV1(user.authUserId, channel.channelId + 1)
    ).toStrictEqual(ERROR);
  });

  test('valid channelId, user is not a member', () => {
    expect(channelDetailsV1(user2.authUserId, channel.channelId)).toStrictEqual(
      ERROR
    );
  });

  test('invalid authUserId', () => {
    expect(
      channelDetailsV1(user.authUserId + 1, channel.channelId)
    ).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toStrictEqual({
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
    channel1 = channelsCreateV1(user1.authUserId, 'Ketoprak', true);
    channel2 = channelsCreateV1(user2.authUserId, 'Bakso', true);
    channel3 = channelsCreateV1(user3.authUserId, 'Batagor', false);
  });
  test('channelId does not exist test 1', () => {
    expect(
      channelJoinV1(user1.authUserId, channel2.channelId + 5)
    ).toStrictEqual(ERROR);
  });
  test('channelId does not exist test 2', () => {
    expect(
      channelJoinV1(user3.authUserId, channel2.channelId + 3)
    ).toStrictEqual(ERROR);
  });
  test('invalid authUserId test 1', () => {
    expect(
      channelJoinV1(user1.authUserId + 4, channel3.channelId)
    ).toStrictEqual(ERROR);
  });
  test('invalid authUserId test 2', () => {
    expect(
      channelJoinV1(user3.authUserId + 10, channel2.channelId)
    ).toStrictEqual(ERROR);
  });
  test('authUserId already in channel test 1', () => {
    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toStrictEqual(
      ERROR
    );
  });
  test('authUserId already in channel test 2', () => {
    expect(channelJoinV1(user2.authUserId, channel2.channelId)).toStrictEqual(
      ERROR
    );
  });
  test('channel is private while non gloabalOwner is joining', () => {
    expect(channelJoinV1(user2.authUserId, channel3.channelId)).toStrictEqual(
      ERROR
    );
  });
  test('channel is private while globalOwner is joining', () => {
    channelJoinV1(user1.authUserId, channel3.channelId);
    expect(
      channelDetailsV1(user1.authUserId, channel3.channelId)
    ).toStrictEqual({
      name: 'Batagor',
      isPublic: false,
      ownerMembers: [
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
        },
      ],
      allMembers: [
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
          handleStr: 'zombieibrahim',
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

  test('Join channel test 1', () => {
    channelJoinV1(user3.authUserId, channel1.channelId);
    expect(
      channelDetailsV1(user3.authUserId, channel1.channelId)
    ).toStrictEqual({
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
    channelJoinV1(user1.authUserId, channel2.channelId);
    expect(
      channelDetailsV1(user1.authUserId, channel2.channelId)
    ).toStrictEqual({
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

describe('testing channelInviteV1', () => {
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
    channel1 = channelsCreateV1(user1.authUserId, 'Ketoprak', true);
    channel2 = channelsCreateV1(user2.authUserId, 'Bakso', true);
    channel3 = channelsCreateV1(user3.authUserId, 'Batagor', false);
  });
  test('channelId does not exist test 1', () => {
    expect(
      channelInviteV1(
        user1.authUserId,
        channel1.channelId + 5,
        user2.authUserId
      )
    ).toStrictEqual(ERROR);
  });
  test('channelId does not exist test 2', () => {
    expect(
      channelInviteV1(
        user3.authUserId,
        channel3.channelId + 3,
        user3.authUserId
      )
    ).toStrictEqual(ERROR);
  });
  test('invalid authUserId test 1', () => {
    expect(
      channelInviteV1(
        user1.authUserId + 4,
        channel3.channelId,
        user2.authUserId
      )
    ).toStrictEqual(ERROR);
  });
  test('invalid authUserId test 2', () => {
    expect(
      channelInviteV1(
        user3.authUserId + 10,
        channel2.channelId,
        user1.authUserId
      )
    ).toStrictEqual(ERROR);
  });
  test('person invited does not exist test 1', () => {
    expect(
      channelInviteV1(
        user1.authUserId,
        channel1.channelId,
        user2.authUserId + 99
      )
    ).toStrictEqual(ERROR);
  });
  test('person invited does not exist test 2', () => {
    expect(
      channelInviteV1(
        user3.authUserId,
        channel3.channelId,
        user1.authUserId + 99
      )
    ).toStrictEqual(ERROR);
  });
  test('person invited already in channel test 1', () => {
    channelJoinV1(user2.authUserId, channel1.channelId);
    expect(
      channelJoinV1(user1.authUserId, channel1.channelId, user2.authUserId)
    ).toStrictEqual(ERROR);
  });
  test('person invited already in channel test 1', () => {
    channelJoinV1(user1.authUserId, channel2.channelId);
    channelJoinV1(user3.authUserId, channel2.channelId);
    expect(
      channelInviteV1(user2.authUserId, channel2.channelId, user3.authUserId)
    ).toStrictEqual(ERROR);
  });
  test('person inviting is not in channel test 1', () => {
    expect(
      channelInviteV1(user1.authUserId, channel2.channelId, user3.authUserId)
    ).toStrictEqual(ERROR);
  });
  test('person inviting is not in channel test 2', () => {
    expect(
      channelInviteV1(user3.authUserId, channel2.channelId, user1.authUserId)
    ).toStrictEqual(ERROR);
  });

  test('Invite person to channel test 1', () => {
    channelInviteV1(user1.authUserId, channel1.channelId, user3.authUserId);
    expect(
      channelDetailsV1(user1.authUserId, channel1.channelId)
    ).toStrictEqual({
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
    channelInviteV1(user2.authUserId, channel2.channelId, user1.authUserId);
    expect(
      channelDetailsV1(user2.authUserId, channel2.channelId)
    ).toStrictEqual({
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

describe('testing channelMessagesV1 (ALL INVALID CASES)', () => {
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
    channel1 = channelsCreateV1(user1.authUserId, true);
    channel2 = channelsCreateV1(user2.authUserId, true);
    channel3 = channelsCreateV1(user3.authUserId, false);
  });
  test('channelId does not exist test', () => {
    expect(
      channelMessagesV1(user1.authUserId, channel1.channelId + 100000, 0)
    ).toStrictEqual(ERROR);
  });
  test('authUserId does not exist test', () => {
    expect(
      channelMessagesV1(user3.authUserId + 999, channel3.channelId, 0)
    ).toStrictEqual(ERROR);
  });
  test('User is not in channel (cannot read messages)', () => {
    expect(
      channelMessagesV1(user3.authUserId, channel2.channelId, 0)
    ).toStrictEqual(ERROR);
  });
  test('start index is greater than the number of messages', () => {
    expect(
      channelMessagesV1(user2.authUserId, channel2.channelId, 999999)
    ).toStrictEqual(ERROR);
  });
  test('No Messages in channel (expect empty array)', () => {
    expect(
      channelMessagesV1(user2.authUserId, channel2.channelId, 0)
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
});

// ChannelMessagesV1 for channels containg messages
// would be tested when there is a way to add messages
