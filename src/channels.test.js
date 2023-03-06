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

describe('channelsListAllV1 Iteration 1 tests', () => {
  let user;
  let channel;
  beforeEach(() => {
    user = authRegisterV1('kevins050324@gmail.com', 'kevin1001', 'Kevin', 'Sutandi');
    user2 = authRegisterV1('someotheremail@gmail.com', 'someone2031', 'Jonah', 'Meggs');

  });

  test('invalid authUserID', () => {
    expect(channelsListAllV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('valid authUserId, no channels were created', () => {
    expect(channelsListAllV1(user2.authUserId)).toStrictEqual({
      channels: []
    })
  });

  // Creates channels to be outputted
  channel = channelsCreateV1(user.authUserId, 'general', true);
  channel2 = channelsCreateV1(user.authUserId, 'memes', true);
  channel3 = channelsCreateV1(user2.authUserId, "Jonah's personal", false);
  test('valid authUserId, channels were created', () => {
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
      channels: [
        {
          channelId: channel.channelId,
          name: 'general'
        },
        {
          channelId: channel2.channelId,
          name: 'memes'
        },
        {
          channelId: channel3.channelId,
          name: "Jonah's personal"
        }
      ]
    });
  })
})
