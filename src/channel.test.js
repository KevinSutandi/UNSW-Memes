import {
  authLoginV1,
  authRegisterV1,
} from "./auth";

import {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1,
} from "./channels";

import {
  channelJoinV1,
  channelInviteV1,
  channelMessagesV1,
  channelDetailsV1
} from "./channel"

const ERROR = { error: expect.any(String) };

describe('channelDetailsV1 Iteration 1 tests', () => {
  let user, user2;
  let channel;
  beforeEach(() => {
    user = authRegisterV1('kevins050324@gmail.com', 'kevin1001', 'Kevin', 'Sutandi');
    user2 = authRegisterV1('someotheremail@gmail.com', 'someone2031', 'Jonah', 'Meggs');
    channel = channelsCreateV1(user.authUserId, 'general', true);
  });

  test('invalid channelId', () => {
    expect(channelDetailsV1(user.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
  });

  test('valid channelId, user is not a member', () => {
    expect(channelDetailsV1(user2.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });

  test('invalid authUserId', () => {
    expect(channelDetailsV1(user.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
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
          handleStr: 'kevinsutandi'
        }
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'kevins050324@gmail.com',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
          handleStr: 'kevinsutandi'
        }
      ]
    });
  });
});
