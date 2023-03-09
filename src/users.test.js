import { authLoginV1, authRegisterV1 } from "./auth";

import { userProfileV1 } from "./users";

import { getData, setData } from "./dataStore";

const ERROR = { error: expect.any(String) };

describe("userProfileV1 iteration 1 testing", () => {
  let user, user2;

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
      authUserId: user.authId,
      authemail: "onlyfortestttt06@gmail.com",
      authfirstname: "Jonah",
      authlastname: "Meggs",
      handlestring: "jonahmeggs",
    });
  });

  test("valid input 2", () => {
    expect(userProfileV1(user.authUserId, user2.authUserId)).toStrictEqual({
      authUserId: user2.authId,
      authemail: "testing12347@gmail.com",
      authfirstname: "Almina",
      authlastname: "Kova",
      handlestring: "alminakova",
    });
  });
});
