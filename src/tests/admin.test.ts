import {
  adminuserPermissionChange,
  adminuserRemove,
  channelsCreate,
  authRegister,
  clearV1,
  channelJoin,
  messageSend,
  dmCreate,
  userProfile,
  channelMessage,
  dmMessages,
  messageSendDm,
} from '../httpHelper';
import {
  AuthReturn,
  channelsCreateReturn,
  dmCreateReturn,
} from '../interfaces';

const STR = expect.any(String);
const NUM = expect.any(Number);
const ARRAY = expect.any(Array);

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

// 400: invalid uId; invalid token; user with uId is the only global owner;
// 403: user with the token is not the global owner
describe('testing adminRemoveV1', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let user3: AuthReturn;
  let channel1: channelsCreateReturn;
  let dm1: dmCreateReturn;
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
    channel1 = channelsCreate(user1.token, 'wego', true);
    dm1 = dmCreate(user1.token, [user2.authUserId]);
  });

  afterEach(() => {
    clearV1();
  });

  test('invalid token test 1', () => {
    expect(adminuserRemove(user1.token + 4, user2.authUserId)).toBe(403);
  });
  test('invalid token test 2', () => {
    expect(adminuserRemove(user1.token + 10, user2.authUserId)).toBe(403);
  });

  test('invalid uId test 1', () => {
    expect(adminuserRemove(user1.token, user1.authUserId + 4)).toBe(400);
  });
  test('invalid uId test 2', () => {
    expect(adminuserRemove(user1.token, user1.authUserId + 10)).toBe(400);
  });

  test('user with uId is the only global owner', () => {
    expect(adminuserRemove(user1.token, user1.authUserId)).toBe(400);
  });

  test('authorised user is not the global owner test 1', () => {
    expect(adminuserRemove(user3.token, user1.authUserId)).toBe(403);
  });
  test('authorised user is not the global owner test 2', () => {
    expect(adminuserRemove(user2.token, user3.authUserId)).toBe(403);
  });

  // valid
  test('meme owner removes other meme owner test ', () => {
    adminuserPermissionChange(user1.token, user2.authUserId, 1);
    channelJoin(user2.token, channel1.channelId);
    messageSend(user1.token, channel1.channelId, 'HIGUYS');
    messageSend(user2.token, channel1.channelId, 'BANNED');
    messageSend(user1.token, channel1.channelId, 'kjsaldajf');
    messageSendDm(user1.token, dm1.dmId, 'BYE');
    messageSendDm(user2.token, dm1.dmId, 'BANNED');
    messageSendDm(user1.token, dm1.dmId, 'ksladjflajsdf');

    adminuserRemove(user2.token, user1.authUserId);
    expect(userProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        email: '',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: '',
        profileImgUrl: STR,
      },
    });

    // check the message
    expect(channelMessage(user2.token, channel1.channelId, 0)).toMatchObject({
      messages: [
        {
          messageId: NUM,
          uId: user1.authUserId,
          message: 'Removed user',
          timeSent: NUM,
          isPinned: false,
          reacts: ARRAY,
        },
        {
          messageId: NUM,
          uId: user2.authUserId,
          message: 'BANNED',
          timeSent: NUM,
          isPinned: false,
          reacts: ARRAY,
        },
        {
          messageId: NUM,
          uId: user1.authUserId,
          message: 'Removed user',
          timeSent: NUM,
          isPinned: false,
          reacts: ARRAY,
        },
      ],
      start: NUM,
      end: NUM,
    });

    expect(dmMessages(user2.token, dm1.dmId, 0)).toMatchObject({
      messages: [
        {
          messageId: NUM,
          uId: user1.authUserId,
          message: 'Removed user',
          timeSent: NUM,
          isPinned: false,
          reacts: ARRAY,
        },
        {
          messageId: NUM,
          uId: user2.authUserId,
          message: 'BANNED',
          timeSent: NUM,
          isPinned: false,
          reacts: ARRAY,
        },
        {
          messageId: NUM,
          uId: user1.authUserId,
          message: 'Removed user',
          timeSent: NUM,
          isPinned: false,
          reacts: ARRAY,
        },
      ],
      start: NUM,
      end: NUM,
    });
  });
});
