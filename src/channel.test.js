import { authRegisterV1 } from "./auth";
import { channelsCreateV1 } from "./channels";
import { channelJoinV1 } from "./channel";
import { clearV1 } from "./other";

const ERROR = { error: expect.any(String) };

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
