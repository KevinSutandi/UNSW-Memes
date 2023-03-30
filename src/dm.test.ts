import { authRegister, clearV1, dmLeave} from './httpHelper';
import { AuthReturn } from './interfaces';

const ERROR = { error: expect.any(String) };


describe('testing dmLeaveV1', () => {
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


  // test when dmId doesnt refer to a valid user
  test('dmId doesnt refer to a valid user', () => {
    const dmId = 2034
    expect(dmLeave(user1.token, dmId)).toStrictEqual(ERROR);
  }); 

  // dmId is valid but authUser is not member of DM
  test('dmId is valid but authUser is not member of DM', () => {
    expect(
      dmLeave(user1.token, user1.dmId)
    ).toStrictEqual(ERROR);
  }); 

  // invalid token
  test('user token is not valid', () => {
    expect(dmLeave('alminaaaaascnj', user.dmId)).toStrictEqual(ERROR);
  });



  // test when successful
  test('successfully leave DM', () => {
    expect(dmLeave(user1.token, user1.dmId)).toStrictEqual({ });
  }); 

});
