import {
  authRegister,
  usersAll,
  clearV1,
  userProfileUploadPhoto,
  setHandle,
  setEmail,
  setName,
  userProfile,
} from './httpHelper';
import { AuthReturn } from './interfaces';

const badrequest = 400;
const forbidden = 403;

describe('userProfile iteration 3 testing', () => {
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

  test('userProfile setHandlerv2', () => {
    expect(setHandle('', 'Batman')).toStrictEqual(forbidden);
    expect(setHandle(user2.token, '')).toStrictEqual(badrequest);
    expect(setHandle(user2.token, '@@@')).toStrictEqual(badrequest);
    expect(
      setHandle(
        user2.token,
        '111111111111111111111111111111111111111111111111111111'
      )
    ).toStrictEqual(badrequest);

    setHandle(user2.token, 'Batman');
    expect(setHandle(user2.token, 'Batman')).toStrictEqual(badrequest);
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

  test('userProfile setEmail', () => {
    expect(setEmail('', '12')).toStrictEqual(forbidden);
    expect(setEmail(user2.token, '12')).toStrictEqual(badrequest);

    setEmail(user.token, 'onlyfortestttt9@gmail.com');
    expect(setEmail(user2.token, 'onlyfortestttt9@gmail.com')).toStrictEqual(
      badrequest
    );
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

  test('userProfile setName', () => {
    expect(setName('', '12', '12')).toStrictEqual(forbidden);
    expect(setName(user2.token, '', '')).toStrictEqual(badrequest);

    expect(setName(user2.token, 'Jonah', 'Meggs')).toStrictEqual({});
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

  test('userProfile userprofile', () => {
    expect(userProfile('', user.authUserId)).toStrictEqual(forbidden);
    expect(userProfile(user.token, 1000000)).toStrictEqual(badrequest);

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

  test('getAllUsers invalid Token', () => {
    expect(usersAll('wrong token')).toStrictEqual(forbidden);
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

  afterEach(() => {
    clearV1();
  });

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
