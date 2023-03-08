import { authRegisterV1 } from './auth';
import { channelsCreateV1, channelsListAllV1 } from './channels';
import { clearV1 } from './other';

describe('testing channelJoinV1', () => {
  let user1;
  let channel1, channel2;
  clearV1();
  user1 = authRegisterV1(
    'kevins050324@gmail.com',
    'kevin1001',
    'Kevin',
    'Sutandi'
  );
  channel1 = channelsCreateV1(user1.authUserId, 'Bongo', true);
  channel2 = channelsCreateV1(user1.authUserId, 'dongo', false);

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
