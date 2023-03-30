import { authRegister } from './httpHelper';
import {
  userProfileV2,
  setEmail,
  setHandle,
  setName,
  getAllUsers,
} from './users';
import { clearV1 } from './other';
import { AuthReturn } from './interfaces';

const ERROR = { error: expect.any(String) };

describe('userProfileV1 iteration 2 testing', () => {
  let user: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    clearV1();
    user = authRegister(
      'onlyfortestttt06@gmail.com',
      'testpw0005',
      'Jonah',
      'Meggs'
    );
    user2 = authRegister(
      'testing12347@gmail.com',
      'hello2883',
      'Almina',
      'Kova'
    );
  });

  test('userProfileV2 invalid Token', () => {
    expect(userProfileV2('wrong token', 1)).toStrictEqual(ERROR);
  });

  test('setEmail invalid Token', () => {
    expect(setEmail('wrong token', 'email')).toStrictEqual(ERROR);
  });

  test('setHandle invalid Token', () => {
    expect(setHandle('wrong token', 'handle')).toStrictEqual(ERROR);
  });

  test('setName invalid Token', () => {
    expect(setName('wrong token', 'name first', 'name last')).toStrictEqual(
      ERROR
    );
  });

  test('getAllUsers invalid Token', () => {
    expect(getAllUsers('wrong token')).toStrictEqual(ERROR);
  });
});
