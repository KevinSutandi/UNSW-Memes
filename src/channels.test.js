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

describe('channelsCreateV1 Iteration 1 tests', () => {
  let user, user2;
  let channel;
  beforeEach(() => {
    user = authRegisterV1('kevins050324@gmail.com', 'kevin1001', 'Kevin', 'Sutandi');
    user2 = authRegisterV1('someotheremail@gmail.com', 'someone2031', 'Jonah', 'Meggs');
    channel = channelsCreateV1(user2.authUserId, 'general', true);
  })

  test('name less than 1 char', () => {
    expect(channelsCreateV1(user.authUserId, '', true)).toStrictEqual(ERROR);
  });

  test('name more than 20 chars', () => {
    expect(channelsCreateV1(user.authUserId, '123456789012345678901', true)).toStrictEqual(ERROR);
  });

  test('invalid authUserId', () => {
    expect(channelsCreateV1(user.authUserId + 1, 'general', false)).toStrictEqual(ERROR);
  });

  /*test('valid input', () => {
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toStrictEqual(
      {
        channelId: channel.channelId,
        name: 'general',
        isPublic: true,
        ownerMembers: [
          {
            uId: user.authUserId,
            email: 'kevins050324@gmail.com',
            nameFirst: 'Kevin',
            nameLast: 'Sutandi',
            handlestr: 'kevinsutandi'
          }
        ],
        allMembers: [
          {
            uId: user.authUserId,
            email: 'kevins050324@gmail.com',
            nameFirst: 'Kevin',
            nameLast: 'Sutandi',
            handlestr: 'kevinsutandi'
          }
        ],
        messages: [],
        start: 0,
        end: 0
      });
  });*/
})
