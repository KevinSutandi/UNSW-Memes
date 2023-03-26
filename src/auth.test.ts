import { authLogin, authRegister, clearV1 } from './httpHelper';
import { AuthReturn } from './interfaces';
const ERROR = { error: expect.any(String) };
const IDPASS = { authUserId: expect.any(Number), token: expect.any(String) };
/**
 * Will reenable userProfile Stuff if done 😀
 */

describe('testing authRegisterV2', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test successful authRegister, without non-alphanumeric', () => {
    const result = authRegister(
      'onlyfortest00@gmail.com',
      'testpw0000',
      'EL_001',
      'YIU'
    );
    expect(result).toStrictEqual(IDPASS);
    // expect(userProfileV1(result.authUserId, result.authUserId)).toStrictEqual({
    //   uId: result.authUserId,
    //   email: 'onlyfortest00@gmail.com',
    //   nameFirst: 'EL_001',
    //   nameLast: 'YIU',
    //   handleStr: 'el001yiu',
    // });
  });

  // for too long user handle- cut at 20th character; convert to lower cases as well
  test('Test successful authRegister with cut-off name', () => {
    const result = authRegister(
      'onlyfortest01@gmail.com',
      'testpw0001',
      'abcdefghijklm',
      'YIUopqrst'
    );
    expect(result).toStrictEqual(IDPASS);
    // expect(userProfileV1(result.authUserId, result.authUserId)).toStrictEqual({
    //   uId: result.authUserId,
    //   email: 'onlyfortest01@gmail.com',
    //   nameFirst: 'abcdefghijklm',
    //   nameLast: 'YIUopqrst',
    //   handleStr: 'abcdefghijklmyiuopqr',
    // });
  });

  // one userid has already been taken, append the smallest number after
  test('Test successful authRegister with ID already be used', () => {
    const result = authRegister(
      'onlyfortest02@gmail.com',
      'testpw0002',
      'kevin',
      'sutandi'
    );
    const result2 = authRegister(
      'onlyfortest01@gmail.com',
      'testpw0001',
      'kevin',
      'sutandi'
    );
    expect(result).toStrictEqual(IDPASS);
    expect(result2).toStrictEqual(IDPASS);
    // expect(userProfileV1(result.authUserId, result.authUserId)).toStrictEqual({
    //   uId: result.authUserId,
    //   email: 'onlyfortest02@gmail.com',
    //   nameFirst: 'kevin',
    //   nameLast: 'sutandi',
    //   handleStr: 'kevinsutandi',
    // });
    // expect(userProfileV1(result2.authUserId, result2.authUserId)).toStrictEqual(
    //   {
    //     uId: result2.authUserId,
    //     email: 'onlyfortest01@gmail.com',
    //     nameFirst: 'kevin',
    //     nameLast: 'sutandi',
    //     handleStr: 'kevinsutandi0',
    //   }
    // );
  });

  // one userid has already been taken, append the smallest number after again
  test('Test successful authRegister with ID already be used.2', () => {
    const result = authRegister(
      'onlyfortest03@gmail.com',
      'testpw0003',
      'abcdefghijklm',
      'YIUopqrst'
    );
    const result2 = authRegister(
      'onlyfortest02@gmail.com',
      'testpw0002',
      'abcdefghijklm',
      'YIUopqrst'
    );
    expect(result).toStrictEqual(IDPASS);
    expect(result2).toStrictEqual(IDPASS);
    // expect(userProfileV1(result.authUserId, result.authUserId)).toStrictEqual({
    //   uId: result.authUserId,
    //   email: 'onlyfortest03@gmail.com',
    //   nameFirst: 'abcdefghijklm',
    //   nameLast: 'YIUopqrst',
    //   handleStr: 'abcdefghijklmyiuopqr',
    // });
    // expect(userProfileV1(result2.authUserId, result2.authUserId)).toStrictEqual(
    //   {
    //     uId: result2.authUserId,
    //     email: 'onlyfortest02@gmail.com',
    //     nameFirst: 'abcdefghijklm',
    //     nameLast: 'YIUopqrst',
    //     handleStr: 'abcdefghijklmyiuopqr0',
    //   }
    // );
  });

  test('Test invalid email', () => {
    expect(
      authRegister(
        'onlyfortest03gmail.com',
        'testpw0003',
        'abcdefghijklm',
        'YIUopqrst'
      )
    ).toStrictEqual(ERROR);
  });

  test('Test already used email', () => {
    authRegister('onlyfortest03@gmail.com', 'testpw0004', 'EL0000', 'EVE0000');
    expect(
      authRegister('onlyfortest03@gmail.com', 'testpw0004', 'EL0000', 'EVE0000')
    ).toStrictEqual(ERROR);
  });

  test('Test too short password', () => {
    expect(
      authRegister('onlyfortest04@gmail.com', 'tpw', 'EL0001', 'EVE001')
    ).toStrictEqual(ERROR);
  });

  test('Test too long nameFirst', () => {
    expect(
      authRegister(
        'onlyfortest05@gmail.com',
        'testpw0005',
        'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop0',
        'EVE002'
      )
    ).toStrictEqual(ERROR);
  });

  test('Test too long nameLast', () => {
    expect(
      authRegister(
        'onlyfortest06@gmail.com',
        'testpw0005',
        'EL0002',
        'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop9'
      )
    ).toStrictEqual(ERROR);
  });
  test('Test too short nameFirst', () => {
    expect(
      authRegister('onlyfortest05@gmail.com', 'testpw0005', '', 'EVE002')
    ).toStrictEqual(ERROR);
  });

  test('Test too short nameLast', () => {
    expect(
      authRegister('onlyfortest06@gmail.com', 'testpw0005', 'EL0002', '')
    ).toStrictEqual(ERROR);
  });
});

describe('/auth/login/v2', () => {
  let user: AuthReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
  });

  test('returns an object with "token and authUserId" key if email and password match', () => {
    const result = authLogin('kevins050324@gmail.com', 'kevin1001');
    expect(result).toStrictEqual({
      token: expect.any(String),
      authUserId: user.authUserId,
    });
  });

  test('returns an object with "error" key if email isnt valid', () => {
    const result = authLogin('kevins050324@gmail.com', 'invalidpassword');
    expect(result).toStrictEqual(ERROR);
  });

  test('returns an object with "error" key if email isnt valid', () => {
    const result = authLogin('invalidemail', 'kevin1001');
    expect(result).toStrictEqual(ERROR);
  });
});