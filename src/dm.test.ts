import { authRegister, clearV1, dmCreate, dmList } from './httpHelper';
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

describe('testing dmListV1', () => {
  let user: AuthReturn, user2: AuthReturn;
  let dm1: dmCreateReturn,
    dm2: dmCreateReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
    user2 = authRegister(
      'testing123445@gmail.com',
      'mina282',
      'Mina',
      'Kov'
    );
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
      dms: [
      ],
    });
  });

  test('valid user with only one dm in the list', () => {
    const uIds: number[] = [];
    dm1 = dmCreate(user.token, uIds);

    expect(dmList(user.token)).toStrictEqual({
      dms: [
        {
          dmId: dm1.dmId,
          name: 'jonahmeggs'
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
          name: 'jonahmeggs'
        },
        {
          dmId: dm2.dmId,
          name: 'jonahmeggs, minakov'
        },
      ],
    });
  });
});
