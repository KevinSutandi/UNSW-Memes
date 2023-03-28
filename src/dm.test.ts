import {
    authRegister,
    clearV1,
    messageSend,
    dmCreateV1,
    dmListV1,
    dmDeleteV1,
    dmDetailsV1,
    dmLeaveV1,
  } from './httpHelper';
  import { AuthReturn } from './interfaces';
  
  const ERROR = { error: expect.any(String) };

describe('testing dm create v1', () => {

  // test when dmId doesnt refer to a valid user
  test('dmId doesnt refer to a valid user', () => {
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

  // dmId is valid but authUser is not member of DM
  test('dmId is valid but authUser is not member of DM', () => {
    expect(
      messageSend(user1.token, user1.dmId)
    ).toStrictEqual(ERROR);
  }); 

  // invalid token
  test('user token is not valid', () => {
    expect(
      messageSend(user1.token + 1, user1.dmId)
    ).toStrictEqual(ERROR);
  }); 


  // test when successful
  test('successfully leave DM', () => {
    expect(
      messageSend(user1.token, user1.dmId)
    ).toStrictEqual(
        { }
    );
  }); 

});
