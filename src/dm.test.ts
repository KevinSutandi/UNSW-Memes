import {
    authRegister,
    clearV1,
    messageSend,
    dmCreateV1,
    dmListV1,
    dmDeleteV1,
    dmDetailV1,
    dmLeaveV1,
    dmMessagesV1,
  } from './httpHelper';
import { AuthReturn } from './interfaces';

const ERROR = { error: expect.any(String) };

describe('testing dm create v1', () => {


    // test when dmId does not refer to a valid DM
    test('dmId does not refer to a valid DM', () => {
        const user1 = authRegister(
          'alminak1938@gmail.com',
          'mina001',
          'Almina',
          'Kov',
        );
        expect(
          messageSend(user1.token, user1.dmId + 1, start)
        ).toStrictEqual(ERROR);
      }); 

    // test when start > total number of messages in the channel
    test('start > total number of messages in the channel', () => {
        expect(
          messageSend(user1.token, user1.dmId, start + 50)
        ).toStrictEqual(ERROR);
      }); 

    // test when dmId is valid but authuser is not member of DM
    test('dmId is valid but authuser is not member of DM', () => {
        expect(
          messageSend(user1.token + 1, user1.dmId, start)
        ).toStrictEqual(ERROR);
      }); 
    
    // token is invalid
    test('token is invalid', () => {
        expect(
          messageSend(user1.token + 1, user1.dmId, start)
        ).toStrictEqual(ERROR);
      }); 

    // test when successful
    test('successfully send message', () => {
        expect(
          messageSend(user1.token, user1.dmId, start)
        ).toStrictEqual(
            {
                messages, 
                start, 
                end,
            }
        );
      }); 

});
