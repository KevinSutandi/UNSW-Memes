import { authLoginV1, authRegisterV1 } from "./auth";

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
} from "./channel";

import { clearV1 } from "./other";

const ERROR = { error: expect.any(String) };

describe("channelDetailsV1 Iteration 1 tests", () => {
  let user, user2;
  let channel;
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
    channel = channelsCreateV1(user.authUserId, "general", true);
  });

  test("invalid channelId", () => {
    expect(
      channelDetailsV1(user.authUserId, channel.channelId + 1)
    ).toStrictEqual(ERROR);
  });

  test("valid channelId, user is not a member", () => {
    expect(channelDetailsV1(user2.authUserId, channel.channelId)).toStrictEqual(
      ERROR
    );
  });

  test("invalid authUserId", () => {
    expect(
      channelDetailsV1(user.authUserId + 1, channel.channelId)
    ).toStrictEqual(ERROR);
  });

  test("valid input", () => {
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toStrictEqual({
      name: "general",
      isPublic: true,
      ownerMembers: [
        {
          authUserId: user.authUserId,
          authemail: "kevins050324@gmail.com",
          authfirstname: "Kevin",
          authlastname: "Sutandi",
          handlestring: "kevinsutandi",
        },
      ],
      allMembers: [
        {
          authUserId: user.authUserId,
          authemail: "kevins050324@gmail.com",
          authfirstname: "Kevin",
          authlastname: "Sutandi",
          handlestring: "kevinsutandi",
        },
      ],
    });
  });
});

describe("testing channelJoinV1", () => {
  let user1, user2, user3;
  let channel1, channel2, channel3;
  beforeEach(() => {
    clearV1();
    user1 = authRegisterV1(
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
    user3 = authRegisterV1(
      "z5352065@ad.unsw.edu.au",
      "big!password3",
      "Zombie",
      "Ibrahim"
    );
    channel1 = channelsCreateV1(user1.authUserId, "Ketoprak", true);
    channel2 = channelsCreateV1(user2.authUserId, "Bakso", true);
    channel3 = channelsCreateV1(user3.authUserId, "Batagor", false);
  });
  test("channelId does not exist test 1", () => {
    expect(
      channelJoinV1(user1.authUserId, channel2.channelId + 5)
    ).toStrictEqual(ERROR);
  });
  test("channelId does not exist test 2", () => {
    expect(
      channelJoinV1(user3.authUserId, channel2.channelId + 3)
    ).toStrictEqual(ERROR);
  });
  test("invalid authUserId test 1", () => {
    expect(
      channelJoinV1(user1.authUserId + 4, channel3.channelId)
    ).toStrictEqual(ERROR);
  });
  test("invalid authUserId test 2", () => {
    expect(
      channelJoinV1(user3.authUserId + 10, channel2.channelId)
    ).toStrictEqual(ERROR);
  });
  test("authUserId already in channel test 1", () => {
    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toStrictEqual(
      ERROR
    );
  });
  test("authUserId already in channel test 2", () => {
    expect(channelJoinV1(user2.authUserId, channel2.channelId)).toStrictEqual(
      ERROR
    );
  });
  test("channel is private while non gloabalOwner is joining", () => {
    expect(channelJoinV1(user2.authUserId, channel3.channelId)).toStrictEqual(
      ERROR
    );
  });
  test("channel is private while globalOwner is joining", () => {
    channelJoinV1(user1.authUserId, channel3.channelId);
    expect(
      channelDetailsV1(user1.authUserId, channel3.channelId)
    ).toStrictEqual({
      name: "Batagor",
      isPublic: false,
      ownerMembers: [
        {
          authUserId: user3.authUserId,
          authemail: "z5352065@ad.unsw.edu.au",
          authfirstname: "Zombie",
          authlastname: "Ibrahim",
          handlestring: "zombieibrahim",
        },
      ],
      allMembers: [
        {
          authUserId: user3.authUserId,
          authemail: "z5352065@ad.unsw.edu.au",
          authfirstname: "Zombie",
          authlastname: "Ibrahim",
          handlestring: "zombieibrahim",
        },
        {
          authUserId: user1.authUserId,
          authemail: "kevins050324@gmail.com",
          authfirstname: "Kevin",
          authlastname: "Sutandi",
          handlestring: "kevinsutandi",
        },
      ],
    });
  });

  test("Join channel test 1", () => {
    channelJoinV1(user3.authUserId, channel1.channelId);
    expect(
      channelDetailsV1(user3.authUserId, channel1.channelId)
    ).toStrictEqual({
      name: "Ketoprak",
      isPublic: true,
      ownerMembers: [
        {
          authUserId: user1.authUserId,
          authemail: "kevins050324@gmail.com",
          authfirstname: "Kevin",
          authlastname: "Sutandi",
          handlestring: "kevinsutandi",
        },
      ],
      allMembers: [
        {
          authUserId: user1.authUserId,
          authemail: "kevins050324@gmail.com",
          authfirstname: "Kevin",
          authlastname: "Sutandi",
          handlestring: "kevinsutandi",
        },
        {
          authUserId: user3.authUserId,
          authemail: "z5352065@ad.unsw.edu.au",
          authfirstname: "Zombie",
          authlastname: "Ibrahim",
          handlestring: "zombieibrahim",
        },
      ],
    });
  });
  test("Join channel test 2", () => {
    channelJoinV1(user1.authUserId, channel2.channelId);
    expect(
      channelDetailsV1(user1.authUserId, channel2.channelId)
    ).toStrictEqual({
      name: "Bakso",
      isPublic: true,
      ownerMembers: [
        {
          authUserId: user2.authUserId,
          authemail: "someotheremail@gmail.com",
          authfirstname: "Jonah",
          authlastname: "Meggs",
          handlestring: "jonahmeggs",
        },
      ],
      allMembers: [
        {
          authUserId: user2.authUserId,
          authemail: "someotheremail@gmail.com",
          authfirstname: "Jonah",
          authlastname: "Meggs",
          handlestring: "jonahmeggs",
        },
        {
          authUserId: user1.authUserId,
          authemail: "kevins050324@gmail.com",
          authfirstname: "Kevin",
          authlastname: "Sutandi",
          handlestring: "kevinsutandi",
        },
      ],
    });
  });
});
