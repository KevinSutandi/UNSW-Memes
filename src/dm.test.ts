import { authRegister, clearV1, dmCreate, dmList } from './httpHelper';
import { AuthReturn } from './interfaces';

 
const ERROR = { error: expect.any(String) };

  

describe('testing dmListV1', () => {
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
  
    // test when there are multiple dms in the list
    test('the token taken is invalid', () => {
        expect(dmList('alminaaaaascnj')).toStrictEqual(ERROR);
        }); 

    test('dm is successful', () => {
        expect(dmCreate(user.token, uIds)).toStrictEqual({
            dms: expect.any(Array),
        });
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