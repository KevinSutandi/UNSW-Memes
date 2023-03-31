import { authRegister, clearV1, dmCreate, dmList} from './httpHelper';
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

  test('dm is successful with one user', () => {
    const uIds = [user.authUserId];
    expect(dmCreate(user.token, uIds)).toStrictEqual({
      dmId: expect.any(Number),
    });
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
    const uIds = [user2.authUserId];
    expect(dmCreate(user.token, uIds)).toStrictEqual(ERROR);
  });
});


describe('testing dmListV1', () => {
  let user: AuthReturn, user2: AuthReturn;
  let dm1: dmCreateReturn;
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

  });

  test('valid user with only one dm in the list', () => {   
    const uIds = [user.authUserId];
    dm1 = dmCreate(user.token, uIds);

    expect(dmList(user.token)).toStrictEqual({
      dms: [
        {
          dmId: dm1.dmId,
          name: user.authUserId,
        },
      ],
    });
  });

  test('valid user with multiple dms in the list', () => {

  });

  // tListAfterLeaveDm
});