import {
  authRegister,
  usersAll,
  clearV1,
  setHandleV2,
  setEmailV2,
  setNameV2,
  userProfileV3,
} from './httpHelper';
import { AuthReturn } from './interfaces';

const ERROR = { error: expect.any(String) };


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

    expect(setHandleV2('', 'Batman')).toStrictEqual({ statusCode: 403, message: 'Invalid token' })
    expect(setHandleV2(user2.token, '')).toStrictEqual({ statusCode: 400, message: 'handle is invalid' })
    expect(setHandleV2(user2.token, '@@@')).toStrictEqual({ statusCode: 400, message: 'handle is invalid' })
    expect(setHandleV2(user2.token, '111111111111111111111111111111111111111111111111111111')).toStrictEqual({ statusCode: 400, message: 'handle is invalid' })

    setHandleV2(user2.token, 'Batman');
    expect(setHandleV2(user2.token, 'Batman')).toStrictEqual({ statusCode: 400, message: 'handle is already had' })
    expect(userProfileV3(user2.token, user2.authUserId)).toStrictEqual({ statusCode: 200,message:{
      user: {
        uId: user2.authUserId,
        email: 'testing12347@gmail.com',
        nameFirst: 'Almina',
        nameLast: 'Kova',
        handleStr: 'Batman',
      }
    }}
    );
  });

  test('userProfile setEmailv2', () => {

    expect(setEmailV2('', '12')).toStrictEqual({ statusCode: 403, message: 'Invalid token' })
    expect(setEmailV2(user2.token, '12')).toStrictEqual({ statusCode: 400, message: 'invalid email' })

    setEmailV2(user.token, 'onlyfortestttt9@gmail.com');
    expect(setEmailV2(user2.token, 'onlyfortestttt9@gmail.com')).toStrictEqual({ statusCode: 400, message: 'email address is already being used by another user' })
    expect(userProfileV3(user.token, user.authUserId)).toStrictEqual({ statusCode: 200,message:{
      user: {
        uId: user.authUserId,
        email: 'onlyfortestttt9@gmail.com',
        nameFirst: 'Jonah',
        nameLast: 'Meggs',
        handleStr: expect.any(String),
      },}
    });
  });

  test('userProfile setNameV2', () => {

    expect(setNameV2('', '12', "12")).toStrictEqual({ statusCode: 403, message: 'Invalid token' })
    expect(setNameV2(user2.token, '', '')).toStrictEqual({ statusCode: 400, message: 'name length should in range of 1 to 50' })

    expect(setNameV2(user2.token, 'Jonah', 'Meggs')).toStrictEqual({statusCode: 200,message:{}});
    expect(userProfileV3(user2.token, user2.authUserId)).toStrictEqual({ statusCode: 200,message:{
      user: {
        uId: user2.authUserId,
        email: 'testing12347@gmail.com',
        nameFirst: 'Jonah',
        nameLast: 'Meggs',
        handleStr: expect.any(String),
      },}
    });
  });

  test('userProfile userprofile', () => {

    expect(userProfileV3('', user.authUserId)).toStrictEqual({ statusCode: 403, message: 'Invalid token' })
    expect(userProfileV3(user.token, 1000000)).toStrictEqual({ statusCode: 400, message: 'Invalid uId' })

    expect(userProfileV3(user.token, user.authUserId)).toStrictEqual({
      statusCode: 200, message: {
        user: {
          uId: user.authUserId,
          email: 'onlyfortestttt06@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: expect.any(String),
        }
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



