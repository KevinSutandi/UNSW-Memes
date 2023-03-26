import { AuthReturn, channelsCreateReturn } from './interfaces';
import {
  authRegister,
  channelsCreate,
  channelDetails,
  channelsList,
  clearV1,
} from './httpHelper';

const ERROR = { error: expect.any(String) };

/*
describe('channelsListAllV1 Iteration 1 tests', () => {
  let user: AuthReturn | errorMessage, user2: AuthReturn | errorMessage;
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
    expect(channelDetails(user.token, channel.channelId)).toStrictEqual({
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

describe('/channels/list/v2', () => {
  let user: AuthReturn, user2: AuthReturn;
  let channel: channelsCreateReturn,
    channel2: channelsCreateReturn,
    channel3: channelsCreateReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister('testing123445@gmail.com', 'mina282', 'Mina', 'Kov');
    channel = channelsCreate(user.token, 'general', false);
    channel2 = channelsCreate(user.token, 'memes', false);
    channel3 = channelsCreate(user2.token, "Jonah's personal", true);
  });

  test('Token is invalid', () => {
    expect(channelsList('asade')).toStrictEqual(ERROR);
  });

  test('valid token, multiple users created in different channels', () => {
    expect(channelsList(user.token)).toStrictEqual({
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

  test('token is valid, one channel created', () => {
    expect(channelsList(user2.token)).toStrictEqual({
      channels: [
        {
          channelId: channel3.channelId,
          name: "Jonah's personal",
        },
      ],
    });
  });
});

describe('/channels/list/v2 no channels', () => {
  let user: AuthReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
  });

  test('no channels', () => {
    expect(channelsList(user.token)).toStrictEqual({
      channels: [],
    });
  });
});