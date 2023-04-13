import {
  authRegister,
  userProfile,
  usersAll,
  setName,
  setEmail,
  setHandle,
  clearV1,
  userProfileUploadPhoto,
} from './httpHelper';
import { AuthReturn } from './interfaces';

const ERROR = { error: expect.any(String) };

describe('userProfile iteration 2 testing', () => {
  let user: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
    user2 = authRegister(
      'testing12347@gmail.com',
      'hello2883',
      'Almina',
      'Kova'
    );
  });
  afterEach(() => {
    clearV1();
  });

  test('userProfile invalid Token', () => {
    expect(userProfile('wrong token', 1)).toStrictEqual(ERROR);
  });

  test('userProfile invalid uId', () => {
    expect(userProfile(user.token, 10000)).toStrictEqual(ERROR);
  });

  test('userProfile run success', () => {
    expect(userProfile(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'onlyfortestttt06@gmail.com',
        nameFirst: 'Jonah',
        nameLast: 'Meggs',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('userProfile run success', () => {
    expect(userProfile(user2.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'testing12347@gmail.com',
        nameFirst: 'Almina',
        nameLast: 'Kova',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('setEmail invalid Token', () => {
    expect(setEmail('wrong token', 'email')).toStrictEqual(ERROR);
  });

  test('setEmail invalid email', () => {
    expect(setEmail(user.token, '123')).toStrictEqual(ERROR);
  });

  test('setEmail email address is already being used by another user', () => {
    expect(setEmail(user.token, 'onlyfortestttt06@gmail.com')).toStrictEqual(
      ERROR
    );
  });

  test('setEmail run success', () => {
    setEmail(user.token, 'onlyfortestttt9@gmail.com');
    expect(userProfile(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'onlyfortestttt9@gmail.com',
        nameFirst: 'Jonah',
        nameLast: 'Meggs',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('setEmail run success', () => {
    setEmail(user2.token, 'testing1234@gmail.com');
    expect(userProfile(user2.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'testing1234@gmail.com',
        nameFirst: 'Almina',
        nameLast: 'Kova',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('setHandle invalid Token', () => {
    expect(setHandle('wrong token', 'handle')).toStrictEqual(ERROR);
  });

  test('setHandle handle length should in range of 3 to 20', () => {
    expect(setHandle(user.token, '0')).toStrictEqual(ERROR);
  });

  test('setHandle run success', () => {
    setHandle(user.token, 'Hello Kitty');
    expect(userProfile(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'onlyfortestttt06@gmail.com',
        nameFirst: 'Jonah',
        nameLast: 'Meggs',
        handleStr: 'Hello Kitty',
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('setHandle  run success', () => {
    setHandle(user2.token, 'Batman');
    expect(userProfile(user2.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'testing12347@gmail.com',
        nameFirst: 'Almina',
        nameLast: 'Kova',
        handleStr: 'Batman',
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('setName invalid Token', () => {
    expect(setName('wrong token', 'name first', 'name last')).toStrictEqual(
      ERROR
    );
  });

  test('setName name length should in range of 1 to 50', () => {
    expect(setName(user.token, '', '')).toStrictEqual(ERROR);
  });

  test('setName run success', () => {
    setName(user.token, 'Almina', 'Kova');
    expect(userProfile(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'onlyfortestttt06@gmail.com',
        nameFirst: 'Almina',
        nameLast: 'Kova',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('setName  run success', () => {
    setName(user2.token, 'Jonah', 'Meggs');
    expect(userProfile(user2.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'testing12347@gmail.com',
        nameFirst: 'Jonah',
        nameLast: 'Meggs',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('getAllUsers invalid Token', () => {
    expect(usersAll('wrong token')).toStrictEqual(ERROR);
  });

  test('getAllUsers  run success', () => {
    expect(usersAll(user.token)).toStrictEqual({
      users: [
        {
          uId: user.authUserId,
          email: 'onlyfortestttt06@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        },
        {
          uId: user2.authUserId,
          email: 'testing12347@gmail.com',
          nameFirst: 'Almina',
          nameLast: 'Kova',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});

describe('userProfileUploadPhoto testing', () => {
  let user: AuthReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
  });

  // afterEach(() => {
  //   clearV1();
  // });

  const validImgUrl = 'http://i.redd.it/v0caqchbtn741.jpg';
  const invalidPNG = 'https://i.imgur.com/2SbRPiD.jpeg';
  const invalid404 = 'https://imgur.com/F9Nf9FKSLJDFHKJLx.jpg';

  test('userProfileUploadPhoto invalid Token', () => {
    expect(
      userProfileUploadPhoto('wrong token', validImgUrl, 0, 0, 200, 200)
    ).toStrictEqual(403);
  });

  test('userProfileUploadPhoto invalid image url (not jpg)', () => {
    expect(
      userProfileUploadPhoto(user.token, invalidPNG, 0, 0, 200, 200)
    ).toStrictEqual(400);
  });

  test('userProfileUploadPhoto invalid image url (404)', () => {
    expect(
      userProfileUploadPhoto(user.token, invalid404, 0, 0, 200, 200)
    ).toStrictEqual(400);
  });

  test('invalid dimensions', () => {
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 0, 0)
    ).toStrictEqual(400);
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 300, 300, 0, 0)
    ).toStrictEqual(400);
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 900, 900)
    ).toStrictEqual(400);
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 200, 900)
    ).toStrictEqual(400);
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 900, 200)
    ).toStrictEqual(400);
  });

  test('userProfileUploadPhoto run success', () => {
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 200, 200)
    ).toStrictEqual({});
  });
});
