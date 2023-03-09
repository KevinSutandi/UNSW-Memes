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
  channelDetailsV1,
} from "./channel"

import {clearV1} from "./other"

const ERROR = { error: expect.any(String) };

describe('channelDetailsV1 Iteration 1 tests', () => {
  let user, user2;
  let channel;
  beforeEach(() => {
    clearV1();
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
          authUserId: user.authUserId,
          authemail: 'kevins050324@gmail.com',
          authfirstname: 'Kevin',
          authlastname: 'Sutandi',
          handlestring: 'kevinsutandi',
        }
      ],
      allMembers: [
        {
          authUserId: user.authUserId,
          authemail: 'kevins050324@gmail.com',
          authfirstname: 'Kevin',
          authlastname: 'Sutandi',
          handlestring: 'kevinsutandi',
        }
      ],
    });
  });
});

const { channelInviteV1 } = require('./channel')

describe('channelInviteV1', () => {
  const validAuthUserId = 'authUserId123'
  const validChannelId = 'channelId456'
  const validUId = 'uId789'

  test('returns an empty object if authUserId, channelId, and uId all exist', () => {
    // Set up mock functions for checkAuthUserIdExists, checkChannelExistsByChannelId, and checkUserExistsByUId
    const checkAuthUserIdExists = jest.fn(() => true)
    const checkChannelExistsByChannelId = jest.fn(() => true)
    const checkUserExistsByUId = jest.fn(() => true)

    // Set up mock data for getData().channels
    const channels = [
      { channelId: validChannelId, allMembers: [validAuthUserId] }
    ]
    const getData = jest.fn(() => ({ channels }))

    // Invoke function with mock parameters and dependencies
    const result = channelInviteV1(validAuthUserId, validChannelId, validUId, {
      checkAuthUserIdExists,
      checkChannelExistsByChannelId,
      checkUserExistsByUId,
      getData
    })

    // Assert that the function returns an empty object
    expect(result).toEqual({})
  })

  test('returns an object with "error" key if authUserId does not exist', () => {
    // Set up mock functions for checkAuthUserIdExists, checkChannelExistsByChannelId, and checkUserExistsByUId
    const checkAuthUserIdExists = jest.fn(() => false)
    const checkChannelExistsByChannelId = jest.fn(() => true)
    const checkUserExistsByUId = jest.fn(() => true)

    // Invoke function with mock parameters and dependencies
    const result = channelInviteV1(validAuthUserId, validChannelId, validUId, {
      checkAuthUserIdExists,
      checkChannelExistsByChannelId,
      checkUserExistsByUId
    });

    // Assert that the function returns an object with "error" key
    expect(result).toHaveProperty('error')
  });

  // Similar tests for other error cases, e.g. when channelId or uId do not exist
});



