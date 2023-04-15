import {
  adminuserPermissionChange,
  channelsCreate,
  authRegister,
  clearV1,
  channelJoin,
} from './httpHelper';
import { AuthReturn, channelsCreateReturn } from './interfaces';

describe('testing adminPermissionChangeV1', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let user3: AuthReturn;
  let channel1: channelsCreateReturn;
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user2 = authRegister(
      'someotheremail@gmail.com',
      'someone2031',
      'Jonah',
      'Meggs'
    );
    user3 = authRegister(
      'z5352065@ad.unsw.edu.au',
      'big!password3',
      'Zombie',
      'Ibrahim'
    );
    channel1 = channelsCreate(user1.token, 'wego', false);
  });

  afterEach(() => {
    clearV1();
  });

  test('invalid token test 1', () => {
    expect(
      adminuserPermissionChange(user1.token + 4, user2.authUserId, 1)
    ).toBe(403);
  });
  test('invalid token test 2', () => {
    expect(
      adminuserPermissionChange(user1.token + 10, user2.authUserId, 1)
    ).toBe(403);
  });

  test('invalid uId test 1', () => {
    expect(
      adminuserPermissionChange(user1.token, user1.authUserId + 4, 1)
    ).toBe(400);
  });
  test('invalid uId test 2', () => {
    expect(
      adminuserPermissionChange(user1.token, user1.authUserId + 10, 1)
    ).toBe(400);
  });

  test('user with uId is the only global owner', () => {
    expect(adminuserPermissionChange(user1.token, user1.authUserId, 2)).toBe(
      400
    );
  });

  test('invalid permissionId test 1', () => {
    expect(adminuserPermissionChange(user1.token, user3.authUserId, 3)).toBe(
      400
    );
  });
  test('invalid permissionId test 2', () => {
    expect(adminuserPermissionChange(user1.token, user2.authUserId, 4)).toBe(
      400
    );
  });

  test('user already has the permission level test 1', () => {
    expect(adminuserPermissionChange(user1.token, user3.authUserId, 2)).toBe(
      400
    );
  });
  test('user already has the permission level test 2', () => {
    expect(adminuserPermissionChange(user1.token, user2.authUserId, 2)).toBe(
      400
    );
  });

  test('authorised user is not the global owner test 1', () => {
    expect(adminuserPermissionChange(user3.token, user1.authUserId, 2)).toBe(
      403
    );
  });
  test('authorised user is not the global owner test 2', () => {
    expect(adminuserPermissionChange(user2.token, user3.authUserId, 1)).toBe(
      403
    );
  });

  test('user1 sets user2 to global owner', () => {
    adminuserPermissionChange(user1.token, user2.authUserId, 1);
    expect(channelJoin(user2.token, channel1.channelId)).toStrictEqual({});
  });

  test('new global owner demotes user1', () => {
    adminuserPermissionChange(user1.token, user2.authUserId, 1);
    adminuserPermissionChange(user1.token, user3.authUserId, 1);
    adminuserPermissionChange(user2.token, user1.authUserId, 2);
    expect(adminuserPermissionChange(user1.token, user2.authUserId, 2)).toBe(
      403
    );
  });
});
