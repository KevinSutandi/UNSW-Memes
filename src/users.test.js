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

  let user 
  
  user = authRegisterV1('onlyfortestttt06@gmail.com', 'testpw0005', 'Jonah','Meggs');

    test('invalid authUserId', () => {
        expect(userProfileV1(user.authUserId + 1)).toStrictEqual(ERROR);
      });
    





})

