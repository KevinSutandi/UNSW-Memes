import {
    authRegister,
    clearV1,
    dmCreateV1,
  } from './httpHelper';
  import { AuthReturn } from './interfaces';
  
  const ERROR = { error: expect.any(String) };
  
  
  // error testing
  
  describe('testing dmCreateV1', () => {
  
  // error testing
    test('any uId does not refer to a valid user', () => {
      const user1 = authRegister(
        'alminak1938@gmail.com',
        'mina001',
        'Almina',
        'Kov',
      );
      expect(
        messageSend(user1.token, user1.uId)
      ).toStrictEqual(ERROR);
    });
    
    test('user token is not valid', () => {
        expect(
          messageSend('alminaaaaascnj', user1.uId)
        ).toStrictEqual(ERROR);
      }); 
  
  
  // test that dm is successful
  
      
  
  
  // test that if multiple are created that it is also successful
  
  
  
  
  // test if one user valid but second dm is invalid
  
  
  

  
});