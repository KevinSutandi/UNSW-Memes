import { AuthReturn } from './interfaces';
import { clearV1 } from './other';
import { authRegisterV1 } from './auth';
import { channelDetailsV1 } from './channel';
import { authRegister, channelsCreate } from './httpHelper';

const ERROR = { error: expect.any(String) };

/*
describe('channelsListAllV1 Iteration 1 tests', () => {
  let user: AuthReturn, user2: AuthReturn;
  let channel, channel2, channel3;
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
  });

  test('invalid authUserID', () => {
    expect(requestChannelsListAll(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('valid authUserId, no channels were created', () => {
    expect(requestChannelsListAll(user2.authUserId)).toStrictEqual({
      channels: [],
    });
  });

  test('valid authUserId, channels were created', () => {
    channel = requestChannelsCreate(user.authUserId, 'general', false);
    channel2 = requestChannelsCreate(user.authUserId, 'memes', false);
    channel3 = requestChannelsCreate(user.authUserId, "Jonah's personal", true);
    expect(requestChannelsListAll(user.authUserId)).toStrictEqual({
      channels: [
        {
          channelId: channel.channelId,
          name: 'general',
        },
        {
          channelId: channel2.channelId,
          name: 'memes',
        },
        {
          channelId: channel3.channelId,
          name: "Jonah's personal",
        },
      ],
    });
  });
});
*/

describe('/channels/create/v2', () => {
  let user: AuthReturn;
  let channel;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
  });

  test('valid input', () => {
    expect(channelsCreate(user.token, 'general', false)).toStrictEqual({
      channelId: expect.any(Number),
    });
  });

  test('name less than 1 char', () => {
    expect(channelsCreate(user.token, '', true)).toStrictEqual(ERROR);
  });

  test('name more than 20 chars', () => {
    expect(
      channelsCreate(user.token, '123456789012345678901', true)
    ).toStrictEqual(ERROR);
  });

  test('invalid token', () => {
    expect(channelsCreate('asade', 'general', false)).toStrictEqual(ERROR);
  });

  test('valid input, with channelsDetailsV1', () => {
    channel = channelsCreate(user.token, 'general', false);
    expect(channel).toStrictEqual({
      channelId: expect.any(Number),
    });
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toStrictEqual({
      name: 'general',
      isPublic: false,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'onlyfortestttt06@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
        },
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'onlyfortestttt06@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: 'jonahmeggs',
        },
      ],
    });
  });
});

/*
describe('/channels/list/v2', () => {
  let user: AuthReturn, user2: AuthReturn;
  let channel: channelsCreateReturn,
    channel2: channelsCreateReturn,
    channel3: channelsCreateReturn;
  beforeEach(() => {
    clearV1();
    user = authRegisterV1(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegisterV1('testing123445@gmail.com', 'mina282', 'Mina', 'Kov');
    channel = requestChannelsCreate(user.authUserId, 'general', false);
    channel2 = requestChannelsCreate(user.authUserId, 'memes', false);
    channel3 = requestChannelsCreate(
      user2.authUserId,
      "Jonah's personal",
      true
    );
  });

  test('authUserId is invalid', () => {
    expect(requestChannelsList(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('valid authUserId, multiple users created in different channels', () => {
    expect(requestChannelsList(user.authUserId)).toStrictEqual({
      channels: [
        {
          channelId: channel.channelId,
          name: 'general',
        },
        {
          channelId: channel2.channelId,
          name: 'memes',
        },
      ],
    });
  });

  test('authUserId is valid, one channel created', () => {
    expect(requestChannelsList(user2.authUserId)).toStrictEqual({
      channels: [
        {
          channelId: channel3.channelId,
          name: "Jonah's personal",
        },
      ],
    });
  });
});
*/
