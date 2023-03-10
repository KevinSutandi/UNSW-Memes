import { authRegisterV1 } from "./auth.js";

import { userProfileV1 } from "./users.js";

import { clearV1 } from "./other.js";

const ERROR = { error: expect.any(String) };

describe("userProfileV1 iteration 1 testing", () => {
  let user, user2;
  beforeEach(() => {
    clearV1();
    user = authRegisterV1(
      "onlyfortestttt06@gmail.com",
      "testpw0005",
      "Jonah",
      "Meggs"
    );
    user2 = authRegisterV1(
      "testing12347@gmail.com",
      "hello2883",
      "Almina",
      "Kova"
    );
  });

  test("invalid authUserId", () => {
    expect(userProfileV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test("invalid uId", () => {
    expect(userProfileV1(user.uId + 1)).toStrictEqual(ERROR);
  });

  test("valid authUserId but invalid uId", () => {
    expect(userProfileV1(user.authUserId, user.uId + 1)).toStrictEqual(ERROR);
  });

  test("valid uId but invalid authUserId", () => {
    expect(userProfileV1(user.authUserId + 1, user.uId)).toStrictEqual(ERROR);
  });

  test("valid input", () => {
    expect(userProfileV1(user2.authUserId, user.authUserId)).toStrictEqual({
      uId: user.authUserId,
      email: "onlyfortestttt06@gmail.com",
      nameFirst: "Jonah",
      nameLast: "Meggs",
      handleStr: "jonahmeggs",
    });
  });

  test("valid input 2", () => {
    expect(userProfileV1(user.authUserId, user2.authUserId)).toStrictEqual({
      uId: user2.authUserId,
      email: "testing12347@gmail.com",
      nameFirst: "Almina",
      nameLast: "Kova",
      handleStr: "alminakova",
    });
  });
});
