import { authLoginV1, authRegisterV1 } from './auth.js';
import { userProfileV1 } from './users.js';
import { clearV1 } from './other.js';
const ERROR = { error: expect.any(String) };
const IDPASS = { authUserId: expect.any(Number) };

describe('testing authRegisterV1', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test successful authRegister, without non-alphanumeric', () => {
    const result = authRegisterV1(
      'onlyfortest00@gmail.com',
      'testpw0000',
      'EL_001',
      'YIU'
    );
    expect(result).toStrictEqual(IDPASS);
    expect(userProfileV1(result.authUserId, result.authUserId)).toStrictEqual({
      uId: result.authUserId,
      email: 'onlyfortest00@gmail.com',
      nameFirst: 'EL_001',
      nameLast: 'YIU',
      handleStr: 'el001yiu',
    });
  });

  // for too long user handle- cut at 20th character; convert to lower cases as well
  test('Test successful authRegister with cut-off name', () => {
    const result = authRegisterV1(
      'onlyfortest01@gmail.com',
      'testpw0001',
      'abcdefghijklm',
      'YIUopqrst'
    );
    expect(result).toStrictEqual(IDPASS);
    expect(userProfileV1(result.authUserId, result.authUserId)).toStrictEqual({
      uId: result.authUserId,
      email: 'onlyfortest01@gmail.com',
      nameFirst: 'abcdefghijklm',
      nameLast: 'YIUopqrst',
      handleStr: 'abcdefghijklmyiuopqr',
    });
  });

  // one userid has already been taken, append the smallest number after
  test('Test successful authRegister with ID already be used', () => {
    const result = authRegisterV1(
      'onlyfortest02@gmail.com',
      'testpw0002',
      'kevin',
      'sutandi'
    );
    const result2 = authRegisterV1(
      'onlyfortest01@gmail.com',
      'testpw0001',
      'kevin',
      'sutandi'
    );
    expect(result).toStrictEqual(IDPASS);
    expect(result2).toStrictEqual(IDPASS);
    expect(userProfileV1(result.authUserId, result.authUserId)).toStrictEqual({
      uId: result.authUserId,
      email: 'onlyfortest02@gmail.com',
      nameFirst: 'kevin',
      nameLast: 'sutandi',
      handleStr: 'kevinsutandi',
    });
    expect(userProfileV1(result2.authUserId, result2.authUserId)).toStrictEqual(
      {
        uId: result2.authUserId,
        email: 'onlyfortest01@gmail.com',
        nameFirst: 'kevin',
        nameLast: 'sutandi',
        handleStr: 'kevinsutandi0',
      }
    );
  });

  // one userid has already been taken, append the smallest number after again
  test('Test successful authRegister with ID already be used.2', () => {
    const result = authRegisterV1(
      'onlyfortest03@gmail.com',
      'testpw0003',
      'abcdefghijklm',
      'YIUopqrst'
    );
    const result2 = authRegisterV1(
      'onlyfortest02@gmail.com',
      'testpw0002',
      'abcdefghijklm',
      'YIUopqrst'
    );
    expect(result).toStrictEqual(IDPASS);
    expect(result2).toStrictEqual(IDPASS);
    expect(userProfileV1(result.authUserId, result.authUserId)).toStrictEqual({
      uId: result.authUserId,
      email: 'onlyfortest03@gmail.com',
      nameFirst: 'abcdefghijklm',
      nameLast: 'YIUopqrst',
      handleStr: 'abcdefghijklmyiuopqr',
    });
    expect(userProfileV1(result2.authUserId, result2.authUserId)).toStrictEqual(
      {
        uId: result2.authUserId,
        email: 'onlyfortest02@gmail.com',
        nameFirst: 'abcdefghijklm',
        nameLast: 'YIUopqrst',
        handleStr: 'abcdefghijklmyiuopqr0',
      }
    );
  });

  test('Test invalid email', () => {
    expect(
      authRegisterV1(
        'onlyfortest03gmail.com',
        'testpw0003',
        'abcdefghijklm',
        'YIUopqrst'
      )
    ).toStrictEqual(ERROR);
  });

  test('Test already used email', () => {
    authRegisterV1(
      'onlyfortest03@gmail.com',
      'testpw0004',
      'EL0000',
      'EVE0000'
    );
    expect(
      authRegisterV1(
        'onlyfortest03@gmail.com',
        'testpw0004',
        'EL0000',
        'EVE0000'
      )
    ).toStrictEqual(ERROR);
  });

  test('Test too short password', () => {
    expect(
      authRegisterV1('onlyfortest04@gmail.com', 'tpw', 'EL0001', 'EVE001')
    ).toStrictEqual(ERROR);
  });

  test('Test too long nameFirst', () => {
    expect(
      authRegisterV1(
        'onlyfortest05@gmail.com',
        'testpw0005',
        'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop0',
        'EVE002'
      )
    ).toStrictEqual(ERROR);
  });

  test('Test too long nameLast', () => {
    expect(
      authRegisterV1(
        'onlyfortest06@gmail.com',
        'testpw0005',
        'EL0002',
        'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop9'
      )
    ).toStrictEqual(ERROR);
  });
});

describe('authLoginV1', () => {
  let user;
  beforeEach(() => {
    clearV1();
    user = authRegisterV1(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
  });

  test('returns an object with "authUserId" key if email and password match', () => {
    const result = authLoginV1('kevins050324@gmail.com', 'kevin1001');
    expect(result).toStrictEqual({ authUserId: user.authUserId });
  });

  test('returns an object with "error" key if email isnt valid', () => {
    const result = authLoginV1('kevins050324@gmail.com', 'invalidpassword');
    expect(result).toStrictEqual(ERROR);
  });

  test('returns an object with "error" key if email isnt valid', () => {
    const result = authLoginV1('invalidemail', 'kevin1001');
    expect(result).toStrictEqual(ERROR);
  });
});
