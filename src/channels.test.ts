import { port, url } from './config.json';
import { authRegisterV1 } from './auth.ts';
import {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1,
} from './channels.ts';
import { channelDetailsV1 } from './channel.ts';
import { clearV1 } from './other.ts';
import { requestHelper } from './helper.ts'

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

// Wrapper functions
function requestChannelsList(token: number) {
  return requestHelper('GET', '/channels/list/v2', {token});
}

function requestChannelsCreate(token: number, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v2', {token, name, isPublic});
}

describe('channelsListAllV1 Iteration 1 tests', () => {
  let user, user2;
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
    expect(channelsListAllV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('valid authUserId, no channels were created', () => {
    expect(channelsListAllV1(user2.authUserId)).toStrictEqual({
      channels: [],
    });
  });

  test('valid authUserId, channels were created', () => {
    channel = channelsCreateV1(user.authUserId, 'general', false);
    channel2 = channelsCreateV1(user.authUserId, 'memes', false);
    channel3 = channelsCreateV1(user.authUserId, "Jonah's personal", true);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
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

describe('/channels/create/v2', () => {
  let user;
  let channel;
  beforeEach(() => {
    clearV1();
    user = authRegisterV1(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
  });

  test('valid input', () => {
    expect(requestChannelsCreateV1(user.authUserId, 'general', false)).toStrictEqual({
      channelId: expect.any(Number),
    });
  });

  test('name less than 1 char', () => {
    expect(requestChannelsCreate(user.authUserId, '', true)).toStrictEqual(ERROR);
  });

  test('name more than 20 chars', () => {
    expect(
      requestChannelsCreate(user.authUserId, '123456789012345678901', true)
    ).toStrictEqual(ERROR);
  });

  test('invalid authUserId', () => {
    expect(
      requestChannelsCreate(user.authUserId + 1, 'general', false)
    ).toStrictEqual(ERROR);
  });

  test('valid input, with channelsDetailsV1', () => {
    channel = requestChannelsCreate(user.authUserId, 'general', false);
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

describe('/channels/list/v2', () => {
  let user, user2;
  let channel, channel2, channel3;
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
    channel3 = requestChannelsCreate(user2.authUserId, "Jonah's personal", true);
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
