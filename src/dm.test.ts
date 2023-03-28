import {
    authRegister,
    clearV1,
    messageSend,
    dmCreate,
    dmList,
  } from './httpHelper';
  import { AuthReturn } from './interfaces';
  
  const ERROR = { error: expect.any(String) };
  

describe('testing dm list', () => {
  
// test when token is invalid

test('the token taken is invalid', () => {
    const user1 = authRegister(
      'alminak1938@gmail.com',
      'mina001',
      'Almina',
      'Kov',
    );
    expect(
        messageSend('alminaaaaascnj', user1.uId)
      ).toStrictEqual(ERROR);
    }); 



// test when there are no dms in the list

/* expect(
    messageSend('alminaaaaascnj', user1.uId)
  ).toStrictEqual(ERROR);
}); 
*/

// test when there is only one dm in the list

/* test('one valid dm', () => {
    expect(
        messageSend(user1.token)
    ).toStrictEqual(
        { dm }
    )
*/


// test when there are multiple dms in the list

/* test('one valid dm', () => {
    expect(
        messageSend(user1.token)
    ).toStrictEqual(
        { dms }
    )
*/







});