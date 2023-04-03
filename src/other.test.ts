import {
  channelsListAll,
  authRegister,
  channelsCreate,
  dmCreate,
  clearV1,
  dmList,
} from './httpHelper';
import { AuthReturn } from './interfaces';

describe('testing clearV1', () => {
  let user1: AuthReturn;
  clearV1();
  user1 = authRegister(
    'kevins050324@gmail.com',
    'kevin1001',
    'Kevin',
    'Sutandi'
  );

  channelsCreate(user1.token, 'test', true);
  channelsCreate(user1.token, 'test2', true);
  dmCreate(user1.token, []);

  clearV1();
  user1 = authRegister(
    'kevins050324@gmail.com',
    'kevin1001',
    'Kevin',
    'Sutandi'
  );

  test('clear should return no channels when called channelsListAllV1', () => {
    expect(channelsListAll(user1.token)).toStrictEqual({ channels: [] });
  });
  test('dm should return no dm when called dmList', () => {
    expect(dmList(user1.token)).toStrictEqual({ dms: [] });
  });
  test('clear everyting', () => {
    expect(clearV1()).toStrictEqual({});
  });
});
