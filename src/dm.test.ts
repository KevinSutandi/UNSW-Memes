import {
    authRegister,
    clearV1,
    dmCreate,
    messageSend,
  } from './httpHelper';
  import { AuthReturn } from './interfaces';
  
  const ERROR = { error: expect.any(String) };
  
  
  // error testing
  
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
  // error testing
    test('any uId does not refer to a valid user', () => {
      const uIds = [user.authUserId]
      expect(
        dmCreate(user.token, uIds)
      ).toStrictEqual(ERROR);
    });
    
    test('user token is not valid', () => {
      const uIds = [user.authUserId]
        expect(
          dmCreate('alminaaaaascnj', uIds)
        ).toStrictEqual(ERROR);
      }); 
  
  
  // test that dm is successful
  
      
  
  
  // test that if multiple are created that it is also successful
  
  
  
  
  // test if one user valid but second dm is invalid
  
  
  

  
});