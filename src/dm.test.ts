import { authRegister, clearV1, dmCreate, dmMessages } from './httpHelper';
import { AuthReturn } from './interfaces';

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

describe('testing dmMessagesV1', () => {
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
  // test when dmId does not refer to a valid DM
  test('dmId does not refer to a valid DM', () => {
    expect(dmMessagesV1(user1.token, user1.dmId + 1, start)).toStrictEqual(ERROR);
  }); 

  // test when start > total number of messages in the channel
  test('start > total number of messages in the channel', () => {
    expect(dmMessagesV1(user1.token, user1.dmId, start + 50)).toStrictEqual(ERROR);
  }); 

  // test when dmId is valid but authuser is not member of DM
  test('dmId is valid but authuser is not member of DM', () => {
    expect(dmMessagesV1(user1.token + 1, user1.dmId, start)).toStrictEqual(ERROR);
  }); 
    
  // token is invalid
  test('token is invalid', () => {
    expect(dmMessagesV1(user1.token + 1, user1.dmId, start)).toStrictEqual(ERROR);
  }); 

  // test when successful
  test('successfully send message', () => {
    expect(messageSend(user1.token, user1.dmId, start)).toStrictEqual(
      {
        messages, 
        start, 
        end,
      }
    );
  }); 
});