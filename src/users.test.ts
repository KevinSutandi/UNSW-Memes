import {
  authRegister,
  usersAll,
  clearV1,
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
        },
        {
          uId: user2.authUserId,
          email: 'testing12347@gmail.com',
          nameFirst: 'Almina',
          nameLast: 'Kova',
          handleStr: expect.any(String),
        },
      ],
    });
  });
});
