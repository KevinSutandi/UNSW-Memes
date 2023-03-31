import {
  authRegister,
  clearV1,
  dmCreate,
  dmDetails,
  dmList,
  dmMessages,
  messageSendDm,
} from './httpHelper';
import { AuthReturn, dmCreateReturn } from './interfaces';

const ERROR = { error: expect.any(String) };

describe('testing dmCreateV1', () => {
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

  test('any uId does not refer to a valid user', () => {
    const uIds = [2032];
    expect(dmCreate(user.token, uIds)).toStrictEqual(ERROR);
  });

  test('user token is not valid', () => {
    const uIds = [user.authUserId];
    expect(dmCreate('alminaaaaascnj', uIds)).toStrictEqual(ERROR);
  });

  test('dm is successful with just owner', () => {
    const uIds: number[] = [];
    expect(dmCreate(user.token, uIds)).toStrictEqual({
      dmId: expect.any(Number),
    });
  });

  test('owner invites owner to dm result error', () => {
    const uIds: number[] = [user.authUserId];
    expect(dmCreate(user.token, uIds)).toStrictEqual(ERROR);
  });

  test('dm is successful with multiple users', () => {
    const user2 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'aevin',
      'sutandi'
    );
    const uIds = [user2.authUserId];
    expect(dmCreate(user.token, uIds)).toStrictEqual({
      dmId: expect.any(Number),
    });
  });

  test('dm has one valid user and the second entry is invalid', () => {
    const uIds = [7586];
    expect(dmCreate(user.token, uIds)).toStrictEqual(ERROR);
  });

  test('dm has two duplicate users', () => {
    const user2 = authRegister(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
    const uIds = [user2.authUserId, user2.authUserId];
    expect(dmCreate(user.token, uIds)).toStrictEqual(ERROR);
  });

  test('dm is successful with multiple users 2', () => {
    const user2 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'aevin',
      'sutandi'
    );
    const user3 = authRegister(
      'lams@gmail.com',
      'asdfasdfasdfasdf',
      'harry',
      'styles'
    );
    const uIds = [user2.authUserId, user3.authUserId];
    expect(dmCreate(user.token, uIds)).toStrictEqual({
      dmId: expect.any(Number),
    });
  });
});

describe('testing dmDetailsV1', () => {
  let user: AuthReturn, user2: AuthReturn, user3: AuthReturn;

  let dm1: dmCreateReturn, dm2: dmCreateReturn, dm3: dmCreateReturn;

  beforeEach(() => {
    clearV1();
    user = authRegister(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
    user2 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user3 = authRegister(
      'z5352065@ad.unsw.edu.au',
      'big!password3',
      'Zombie',
      'Ibrahim'
    );
    const uIds = [user.authUserId, user2.authUserId];
    dm1 = dmCreate(user.token, uIds);
    dm2 = dmCreate(user2.token, uIds);
    dm3 = dmCreate(user3.token, uIds);
  });

  afterEach(() => {
    clearV1();
  });

  test('user token is not valid', () => {
    expect(dmDetails('alminaaaaascnj', dm2.dmId)).toStrictEqual(ERROR);
  });

  // test when dmId does not refer to valid dm
  test('dmId doesnt refer to a valid user', () => {
    expect(dmDetails(user.token, dm1.dmId + 10)).toStrictEqual(ERROR);
  });

  // test when dmId is valid but authUser is not a member of dm
  test('dmId is valid but authUser is not member of DM', () => {
    expect(dmDetails(user3.token, dm2.dmId)).toStrictEqual(ERROR);
  });

  test('valid dm with one user', () => {
    expect(dmDetails(user.token, dm3.dmId)).toStrictEqual({
      name: 'jonahmeggs, kevinsutandi, zombieibrahim',
      members: [
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          handleStr: 'zombieibrahim',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
        },
        {
          uId: user.authUserId,
          email: 'onlyfortestttt06@gmail.com',
          handleStr: 'jonahmeggs',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
        },
        {
          uId: user2.authUserId,
          email: 'kevins050324@gmail.com',
          handleStr: 'kevinsutandi',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
        },
      ],
    });
  });
});

describe('testing dmListV1', () => {
  let user: AuthReturn, user2: AuthReturn;
  let dm1: dmCreateReturn, dm2: dmCreateReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
    user2 = authRegister('testing123445@gmail.com', 'mina282', 'Mina', 'Kov');
  });

  afterEach(() => {
    clearV1();
  });
  // test when there are multiple dms in the list
  test('the token taken is invalid', () => {
    expect(dmList('alminaaaaascnj')).toStrictEqual(ERROR);
  });

  test('valid user but there are no dms in the list', () => {
    expect(dmList(user2.token)).toStrictEqual({
      dms: [],
    });
  });

  test('valid user with only one dm in the list', () => {
    const uIds: number[] = [];
    dm1 = dmCreate(user.token, uIds);

    expect(dmList(user.token)).toStrictEqual({
      dms: [
        {
          dmId: dm1.dmId,
          name: 'jonahmeggs',
        },
      ],
    });
  });

  test('valid user with multiple dms in the list', () => {
    const uIds1: number[] = [];
    const uIds2 = [user.authUserId];
    dm1 = dmCreate(user.token, uIds1);
    dm2 = dmCreate(user2.token, uIds2);

    expect(dmList(user.token)).toStrictEqual({
      dms: [
        {
          dmId: dm1.dmId,
          name: 'jonahmeggs',
        },
        {
          dmId: dm2.dmId,
          name: 'jonahmeggs, minakov',
        },
      ],
    });
  });
});

describe('testing dmMessagesV1 error cases', () => {
  let user: AuthReturn, user2: AuthReturn, user3: AuthReturn;

  let dm1: dmCreateReturn, dm2: dmCreateReturn, dm3: dmCreateReturn;

  beforeEach(() => {
    clearV1();
    user = authRegister(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
    user2 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    user3 = authRegister(
      'z5352065@ad.unsw.edu.au',
      'big!password3',
      'Zombie',
      'Ibrahim'
    );
    const uIds = [user2.authUserId, user3.authUserId];
    const uIds2 = [user.authUserId, user3.authUserId];
    const uIds3 = [user.authUserId, user2.authUserId];
    dm1 = dmCreate(user.token, uIds);
    dm2 = dmCreate(user2.token, uIds2);
    dm3 = dmCreate(user3.token, uIds3);
  });

  afterEach(() => {
    clearV1();
  });

  // test when dmId does not refer to a valid DM
  test('dmId does not refer to a valid DM', () => {
    expect(dmMessages(user.token, dm1.dmId + 1, 0)).toStrictEqual(ERROR);
  });

  // test when start > total number of messages in the channel
  test('start > total number of messages in the channel', () => {
    expect(dmMessages(user.token, dm1.dmId, 999999)).toStrictEqual(ERROR);
  });

  // test when dmId is valid but authuser is not member of DM
  test('dmId is valid but authuser is not member of DM', () => {
    const user4 = authRegister(
      'laskdjflk@gmail.com',
      'wekvsadf',
      'Kevin',
      'Sutandi'
    );
    expect(dmMessages(user4.token, dm1.dmId, 0)).toStrictEqual(ERROR);
  });

  // token is invalid
  test('token is invalid', () => {
    expect(dmMessages(user2.token + 999, dm2.dmId, 0)).toStrictEqual(ERROR);
  });

  test('No Messages in channel (expect empty array)', () => {
    expect(dmMessages(user.token, dm3.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('30 messages in array', () => {
    for (let i = 0; i < 30; i++) {
      messageSendDm(user.token, dm1.dmId, `message ${i}`);
    }
    expect(dmMessages(user.token, dm1.dmId, 0)).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
    expect(dmMessages(user.token, dm1.dmId, 0).messages.length).toBe(30);
  });

  test('60 messages in array', () => {
    for (let i = 0; i < 60; i++) {
      messageSendDm(user.token, dm1.dmId, `message ${i}`);
    }
    expect(dmMessages(user.token, dm1.dmId, 0)).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50,
    });
    expect(dmMessages(user.token, dm1.dmId, 0).messages.length).toBe(50);
    expect(dmMessages(user.token, dm1.dmId, 50)).toStrictEqual({
      messages: expect.any(Array),
      start: 50,
      end: -1,
    });
    expect(dmMessages(user.token, dm1.dmId, 50).messages.length).toBe(10);
  });
});
