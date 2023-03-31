import { authRegister, clearV1, dmCreate, dmDetails } from './httpHelper';
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
  let user: AuthReturn,
  user2: AuthReturn,
  user3: AuthReturn;

  let dm1: dmCreateReturn,
    dm2: dmCreateReturn,
    dm3: dmCreateReturn;

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
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'onlyfortestttt06@gmail.com',
          handleStr: 'jonahmeggs',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
        },
      ],
      allMembers: [
        {
          uId: user2.authUserId,
          email: 'kevins050324@gmail.com',
          handleStr: 'kevinsutandi',
          nameFirst: 'Kevin',
          nameLast: 'Sutandi',
        },
        {
          uId: user3.authUserId,
          email: 'z5352065@ad.unsw.edu.au',
          handleStr: 'big!password3',
          nameFirst: 'Zombie',
          nameLast: 'Ibrahim',
        },
      ],
    });
  });
});
