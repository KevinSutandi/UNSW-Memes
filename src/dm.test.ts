import { authRegister, clearV1, dmCreate, dmDetails } from './httpHelper';
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


  test('user token is not valid', () => {
    expect(dmDetails('alminaaaaascnj', user.dmId)).toStrictEqual(ERROR);
  });


// test when dmId does not refer to valid dm
    test('dmId does not refer to a valid user', () => {
      const dmId = 2032;
      expect(dmDetails(user.token, dmId)).toStrictEqual(ERROR);
    }); 


// test when dmId is valid but authUser is not a member of dm
    test('dmId is valid but authUser is not a member of dm', () => {
        expect(
        messageSend(user1.token + 1, user1.dmId)
        ).toStrictEqual(ERROR);
    }); 

// test when it is succeful
  test('dm details is successful', () => {
      expect(dmDetails(user1.token, user1.dmId)).toStrictEqual(
          { 
              name, 
              members, 
          }
      );
  }); 
});
  