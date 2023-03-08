import { authRegisterV1 } from "./auth";
import { channelsCreateV1 } from "./channels";
import { channelJoinV1 } from "./channel";
import { clearV1 } from "./other";

describe("testing channelJoinV1", () => {
  let user1, user2, user3;
  let channel1, channel2, channel3;
  beforeEach(() => {
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
    channel1 = channelsCreateV1(user1.authUserId, true);
    channel2 = channelsCreateV1(user2.authUserId, true);
    channel3 = channelsCreateV1(user3.authUserId, false);
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
  test("Join channel test 1", () => {
    expect(channelJoinV1(user1.authUserId, channel2.channelId)).toStrictEqual(
      {}
    );
  });
  test("Join channel test 2", () => {
    expect(channelJoinV1(user2.authUserId, channel3.channelId)).toStrictEqual(
      {}
    );
  });
  test("Join channel test 3", () => {
    expect(channelJoinV1(user3.authUserId, channel1.channelId)).toStrictEqual(
      {}
    );
  });
});

describe("testing channelMessagesV1 (ALL INVALID CASES)", () => {
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
    channel1 = channelsCreateV1(user1.authUserId, true);
    channel2 = channelsCreateV1(user2.authUserId, true);
    channel3 = channelsCreateV1(user3.authUserId, false);
  });
  test("channelId does not exist test", () => {
    expect(
      channelMessagesV1(user1.authUserId, channel1.channelId + 100000, 0)
    ).toStrictEqual(ERROR);
  });
  test("authUserId does not exist test", () => {
    expect(
      channelMessagesV1(user3.authUserId + 999, channel3.channelId, 0)
    ).toStrictEqual(ERROR);
  });
  test("User is not in channel (cannot read messages)", () => {
    expect(
      channelMessagesV1(user3.authUserId, channel2.channelId, 0)
    ).toStrictEqual(ERROR);
  });
  test("start index is greater than the number of messages", () => {
    expect(
      channelMessagesV1(user2.authUserId, channel2.channelId, 999999)
    ).toStrictEqual(ERROR);
  });
  test("No Messages in channel (expect empty array)", () => {
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
