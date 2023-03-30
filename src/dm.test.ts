import { authRegister, clearV1, dmMessages } from './httpHelper';
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
