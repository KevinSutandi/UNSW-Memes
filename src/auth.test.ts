import { getData } from './dataStore';
import {
  authLogin,
  authRegister,
  channelsCreate,
  // channelsList,
  clearV1,
  authLogout,
  userProfile,
  passwordResetRequest,
  passwordResetReset,
} from './httpHelper';
import { AuthReturn } from './interfaces';

const INPUT_ERROR = 400;
const IDPASS = { authUserId: expect.any(Number), token: expect.any(String) };

describe('testing authRegisterV3', () => {
  beforeEach(() => {
    clearV1();
  });

  afterEach(() => {
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
    expect(userProfile(result.token, result.authUserId)).toStrictEqual({
      user: {
        uId: result.authUserId,
        email: 'onlyfortest00@gmail.com',
        nameFirst: 'EL_001',
        nameLast: 'YIU',
        handleStr: 'el001yiu',
        profileImgUrl: expect.any(String),
      },
    });
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
    expect(userProfile(result.token, result.authUserId)).toStrictEqual({
      user: {
        uId: result.authUserId,
        email: 'onlyfortest01@gmail.com',
        nameFirst: 'abcdefghijklm',
        nameLast: 'YIUopqrst',
        handleStr: 'abcdefghijklmyiuopqr',
        profileImgUrl: expect.any(String),
      },
    });
  });

  // one userid has already been taken, append the smallest number after
  test('Test successful authRegister with ID already be used (2 peeps)', () => {
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
    expect(userProfile(result.token, result.authUserId)).toStrictEqual({
      user: {
        uId: result.authUserId,
        email: 'onlyfortest02@gmail.com',
        nameFirst: 'kevin',
        nameLast: 'sutandi',
        handleStr: 'kevinsutandi',
        profileImgUrl: expect.any(String),
      },
    });
    expect(userProfile(result2.token, result2.authUserId)).toStrictEqual({
      user: {
        uId: result2.authUserId,
        email: 'onlyfortest01@gmail.com',
        nameFirst: 'kevin',
        nameLast: 'sutandi',
        handleStr: 'kevinsutandi0',
        profileImgUrl: expect.any(String),
      },
    });
  });

  // one userid has already been taken, append the smallest number after again
  test('Test successful authRegister with ID already be used (3 peeps)', () => {
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
    const result3 = authRegister(
      'onlyfortest06@gmail.com',
      'testpw0006',
      'abcdefghijklm',
      'YIUopqrst'
    );
    expect(result).toStrictEqual(IDPASS);
    expect(result2).toStrictEqual(IDPASS);
    expect(result3).toStrictEqual(IDPASS);
    expect(userProfile(result.token, result.authUserId)).toStrictEqual({
      user: {
        uId: result.authUserId,
        email: 'onlyfortest03@gmail.com',
        nameFirst: 'abcdefghijklm',
        nameLast: 'YIUopqrst',
        handleStr: 'abcdefghijklmyiuopqr',
        profileImgUrl: expect.any(String),
      },
    });
    expect(userProfile(result2.token, result2.authUserId)).toStrictEqual({
      user: {
        uId: result2.authUserId,
        email: 'onlyfortest02@gmail.com',
        nameFirst: 'abcdefghijklm',
        nameLast: 'YIUopqrst',
        handleStr: 'abcdefghijklmyiuopqr0',
        profileImgUrl: expect.any(String),
      },
    });
    expect(userProfile(result3.token, result3.authUserId)).toStrictEqual({
      user: {
        uId: result3.authUserId,
        email: 'onlyfortest06@gmail.com',
        nameFirst: 'abcdefghijklm',
        nameLast: 'YIUopqrst',
        handleStr: 'abcdefghijklmyiuopqr1',
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('Test invalid email', () => {
    expect(
      authRegister('@gmail.com', 'testpw0003', 'abcdefghijklm', 'YIUopqrst')
    ).toBe(INPUT_ERROR);
  });
  test('Test invalid email 2', () => {
    expect(
      authRegister('doggo', 'testpw0003', 'abcdefghijklm', 'YIUopqrst')
    ).toBe(INPUT_ERROR);
  });
  test('Test invalid email 3', () => {
    expect(
      authRegister(
        'doggo@gmail@gmail.com',
        'testpw0003',
        'abcdefghijklm',
        'YIUopqrst'
      )
    ).toBe(INPUT_ERROR);
  });

  test('Test already used email', () => {
    authRegister('onlyfortest03@gmail.com', 'testpw0004', 'EL0000', 'EVE0000');
    expect(
      authRegister('onlyfortest03@gmail.com', 'testpw0004', 'EL0000', 'EVE0000')
    ).toBe(INPUT_ERROR);
  });

  test('Test too short password', () => {
    expect(
      authRegister('onlyfortest04@gmail.com', 'short', 'EL0001', 'EVE001')
    ).toBe(INPUT_ERROR);
  });

  test('Test no password', () => {
    expect(
      authRegister('onlyfortest04@gmail.com', '', 'EL0001', 'EVE001')
    ).toBe(INPUT_ERROR);
  });

  test('Test too long nameFirst', () => {
    expect(
      authRegister(
        'onlyfortest05@gmail.com',
        'testpw0005',
        'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop0',
        'EVE002'
      )
    ).toBe(INPUT_ERROR);
  });

  test('Test too long nameLast', () => {
    expect(
      authRegister(
        'onlyfortest06@gmail.com',
        'testpw0005',
        'EL0002',
        'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop9'
      )
    ).toBe(INPUT_ERROR);
  });
  test('Test too short nameFirst', () => {
    expect(
      authRegister('onlyfortest05@gmail.com', 'testpw0005', '', 'EVE002')
    ).toBe(INPUT_ERROR);
  });

  test('Test too short nameLast', () => {
    expect(
      authRegister('onlyfortest06@gmail.com', 'testpw0005', 'EL0002', '')
    ).toBe(INPUT_ERROR);
  });
});

describe('/auth/login/v3', () => {
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

  afterEach(() => {
    clearV1();
  });

  test('returns an object with "token and authUserId" key if email and password match', () => {
    const result = authLogin('kevins050324@gmail.com', 'kevin1001');
    expect(result).toStrictEqual({
      token: expect.any(String),
      authUserId: user.authUserId,
    });
  });

  test('returns an object with "error" key if password isnt valid', () => {
    const result = authLogin('kevins050324@gmail.com', 'invalidpassword');
    expect(result).toEqual(400);
  });

  test('returns an object with "error" key if email isnt valid', () => {
    const result = authLogin('invalidemail', 'kevin1001');
    expect(result).toEqual(400);
  });
});

describe('/auth/logout/v1', () => {
  let user: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
  });

  afterEach(() => {
    clearV1();
  });

  test('invalid token', () => {
    expect(authLogout('asade')).toStrictEqual(403);
  });
  test('logout success', () => {
    authLogout(user.token);
    // will reenable when channelsList is done
    // expect(channelsList(user.token)).toStrictEqual(403);
  });
  test('logout, then login', () => {
    authLogout(user.token);
    user = authLogin('kevins050324@gmail.com', 'kevin1001');
    expect(channelsCreate(user.token, 'general', true)).toStrictEqual({
      channelId: expect.any(Number),
    });
  });
  test('logout duplicate', () => {
    authLogout(user.token);
    expect(authLogout(user.token)).toStrictEqual(403);
  });
  test('logged out but logged in on two devices', () => {
    user2 = authLogin('kevins050324@gmail.com', 'kevin1001');
    authLogout(user.token);
    expect(channelsCreate(user2.token, 'general', true)).toStrictEqual({
      channelId: expect.any(Number),
    });
  });
});

describe('password reset request', () => {
  let user: AuthReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister('kevins050@gmail.com', 'kevin1001', 'Kevin', 'Sutandi');
  });

  afterEach(() => {
    clearV1();
  });
  test('invalid email, does not return error', () => {
    expect(passwordResetRequest('gunman@gmail.com')).toStrictEqual({});
  });
  test('valid email then logout', () => {
    expect(passwordResetRequest('kevins050@gmail.com')).toStrictEqual({});
    expect(authLogout(user.token)).toStrictEqual(403);
  });
});

describe('password reset', () => {
  let user: AuthReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister('kevins050@gmail.com', 'kevin1001', 'Kevin', 'Sutandi');
  });

  afterEach(() => {
    clearV1();
  });

  test('Invalid reset code', () => {
    expect(passwordResetReset('123456', 'newhardpassword')).toStrictEqual(400);
  });

  test('new password is too short', () => {
    expect(passwordResetRequest('kevins050@gmail.com')).toStrictEqual({});
    const data = getData();
    const resetCode = data.resetCodes[0].resetCode;
    expect(passwordResetReset(resetCode, 'new')).toStrictEqual(400);
  });

  test('valid input', () => {
    expect(passwordResetRequest('kevins050@gmail.com')).toStrictEqual({});
    const data = getData();
    const resetCode = data.resetCodes[0].resetCode;
    expect(passwordResetReset(resetCode, 'newhardpassword')).toStrictEqual({});
    expect(authLogin('kevins050@gmail.com', 'newhardpassword')).toStrictEqual({
      authUserId: user.authUserId,
      token: expect.any(String),
    });
  });

  test('valid input, user requested twice', () => {
    expect(passwordResetRequest('kevins050@gmail.com')).toStrictEqual({});
    expect(passwordResetRequest('kevins050@gmail.com')).toStrictEqual({});
    const data = getData();
    const resetCode = data.resetCodes[0].resetCode;
    expect(passwordResetReset(resetCode, 'newhardpassword')).toStrictEqual({});
    expect(authLogin('kevins050@gmail.com', 'newhardpassword')).toStrictEqual({
      authUserId: user.authUserId,
      token: expect.any(String),
    });
  });
});
