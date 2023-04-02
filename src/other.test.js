import { authRegisterV1 } from './auth.js';
import { channelsCreateV1, channelsListAllV1 } from './channels.js';
import { clearV1 } from './other.js';

describe('testing channelJoinV1', () => {
  let user1;
  clearV1();
  user1 = authRegisterV1(
    'kevins050324@gmail.com',
    'kevin1001',
    'Kevin',
    'Sutandi'
  );

  channelsCreateV1(user1.authUserId, 'Bongo', true);
  channelsCreateV1(user1.authUserId, 'dongo', false);

  clearV1();
  user1 = authRegisterV1(
    'kevins050324@gmail.com',
    'kevin1001',
    'Kevin',
    'Sutandi'
  );
  test('clear should return no channels when called channelsListAllV1', () => {
    expect(channelsListAllV1(user1.authUserId)).toStrictEqual({ channels: [] });
  });
});
