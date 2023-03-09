import {
    authLoginV1,
    authRegisterV1
  } from "./auth";
  

import {
    userProfileV1
} from "./users";

import {getData, setData} from "./dataStore";

const ERROR = { error: expect.any(String) };

describe("userProfileV1 iteration 1 testing", () => {

  let user, user2; 
  
  user = authRegisterV1('onlyfortestttt06@gmail.com', 'testpw0005', 'Jonah','Meggs');
  user2 = authRegisterV1('testing12347@gmail.com', 'hello2883', 'Almina','Kova');

    test('invalid authUserId', () => {
        expect(userProfileV1(user.authUserId + 1)).toStrictEqual(ERROR);
      });

    test('invalid uId', () => {
      expect(userProfileV1(user.uId + 1)).toStrictEqual(ERROR);
    });

    test('valid authUserId but invalid uId', () => {
      expect(userProfileV1(user.authUserId, user.uId + 1)).toStrictEqual(ERROR);
    });

    test('valid uId but invalid authUserId', () => {
      expect(userProfileV1(user.authUserId + 1, user.uId)).toStrictEqual(ERROR);
    });


    // not working
    test('valid input', () => {
      expect(userProfileV1(user.authUserId, user.uId)).toStrictEqual({
        users: [
          {
          uId: user.uId,
          email: 'onlyfortestttt06@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: user.handleStr,
          },
        ],
      });
      
    })



})

