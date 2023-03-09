import { authLoginV1, authRegisterV1 } from "./auth.js";

import {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1,
} from "./channels.js";

import {
  channelJoinV1,
  channelInviteV1,
  channelMessagesV1,
  channelDetailsV1,
} from "./channel.js";

import { clearV1 } from "./other.js";

const ERROR = { error: expect.any(String) };

describe("channelsListAllV1 Iteration 1 tests", () => {
  let user, user2;
  let channel, channel2, channel3;
  beforeEach(() => {
    clearV1();
    user = authRegisterV1(
      "kevins050324@gmail.com",
      "kevin1001",
      "Kevin",
      "Sutandi"
    );
    user2 = authRegisterV1(
      "someotheremail@gmail.com",
      "someone2031",
      "Jonah",
      "Meggs"
    );
  });

  test("invalid authUserID", () => {
    expect(channelsListAllV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test("valid authUserId, no channels were created", () => {
    expect(channelsListAllV1(user2.authUserId)).toStrictEqual({
      channels: [],
    });
  });

  test("valid authUserId, channels were created", () => {
    channel = channelsCreateV1(user.authUserId, "general", false);
    channel2 = channelsCreateV1(user.authUserId, "memes", false);
    channel3 = channelsCreateV1(user.authUserId, "Jonah's personal", true);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
      channels: [
        {
          channelId: channel.channelId,
          name: "general",
        },
        {
          channelId: channel2.channelId,
          name: "memes",
        },
        {
          channelId: channel3.channelId,
          name: "Jonah's personal",
        },
      ],
    });
  });
});

describe("channelsCreateV1 Iteration 1 tests", () => {
  let user, user2, user3;
  let channel, channel2;
  beforeEach(() => {
    user = authRegisterV1(
      "onlyfortestttt06@gmail.com",
      "testpw0005",
      "Jonah",
      "Meggs"
    );
    user2 = authRegisterV1(
      "someotheremail@gmail.com",
      "someone2031",
      "Kevin",
      "Sutandi"
    );
  });

  test("valid input", () => {
    expect(channelsCreateV1(user.authUserId, "general", false)).toStrictEqual({
      channelId: expect.any(Number),
    });
  });

  test("name less than 1 char", () => {
    expect(channelsCreateV1(user.authUserId, "", true)).toStrictEqual(ERROR);
  });

  test("name more than 20 chars", () => {
    expect(
      channelsCreateV1(user.authUserId, "123456789012345678901", true)
    ).toStrictEqual(ERROR);
  });

  test("invalid authUserId", () => {
    expect(
      channelsCreateV1(user.authUserId + 1, "general", false)
    ).toStrictEqual(ERROR);
  });

  /*test('valid input, with channelsDetailsV1', () => {
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
});

describe("channelsListV1 Iteration 1 test", () => {
  let user, user2;
  let channel, channel2, channel3;
  beforeEach(() => {
    clearV1();
    user = authRegisterV1(
      "kevins050324@gmail.com",
      "kevin1001",
      "Kevin",
      "Sutandi"
    );
    user2 = authRegisterV1("testing123445@gmail.com", "mina282", "Mina", "Kov");
    channel = channelsCreateV1(user.authUserId, "general", false);
    channel2 = channelsCreateV1(user.authUserId, "memes", false);
    channel3 = channelsCreateV1(user2.authUserId, "Jonah's personal", true);
  });

  test("authUserId is invalid", () => {
    expect(channelsListV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test("valid authUserId, multiple users created in different channels", () => {
    expect(channelsListV1(user.authUserId)).toStrictEqual({
      channels: [
        {
          channelId: channel.channelId,
          name: "general",
        },
        {
          channelId: channel2.channelId,
          name: "memes",
        },
      ],
    });
  });

  test("authUserId is valid, one channel created", () => {
    expect(channelsListV1(user2.authUserId)).toStrictEqual({
      channels: [
        {
          channelId: channel3.channelId,
          name: "Jonah's personal",
        },
      ],
    });
  });
});
