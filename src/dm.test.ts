import {
    authRegister,
    clearV1,
    messageSend,
    dmCreateV1,
    dmListV1,
    dmDeleteV1,
    dmDetailsV1
  } from './httpHelper';
import { AuthReturn } from './interfaces';
  
const ERROR = { error: expect.any(String) };

describe('testing dm create v1', () => {

// test when dmId does not refer to valid dm
    test('dmId does not refer to a valid user', () => {
        const user1 = authRegister(
        'alminak1938@gmail.com',
        'mina001',
        'Almina',
        'Kov',
        );
        expect(
        messageSend(user1.token, user1.dmId + 1)
        ).toStrictEqual(ERROR);
    }); 


// test when dmId is valid but authUser is not a member of dm

    test('dmId is valid but authUser is not a member of dm', () => {
        expect(
        messageSend(user1.token + 1, user1.dmId)
        ).toStrictEqual(ERROR);
    }); 

// test when the token is invalid
    test('user token is not valid', () => {
        expect(
        messageSend(user1.token + 1, user1.dmId)
        ).toStrictEqual(ERROR);
    }); 

// test when it is succeful
test('dm details is successful', () => {
    expect(
    messageSend(user1.token, user1.dmId)
    ).toStrictEqual(
        { 
            name, 
            members, 
        }
    );
}); 
});
  