import {
  authLogout,
  channelJoin,
  channelLeave,
  channelMessage,
  standUpActive,
  standUpSend,
  standUpStart,
} from '../httpHelper';
import { authRegister, channelsCreate, clearV1 } from '../httpHelper';
import { AuthReturn } from '../interfaces';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms * 1000));
}

describe('Test error cases for standup Start without async', () => {
  let user1: AuthReturn;
  let channel1: { channelId: number };
  beforeEach(() => {
    clearV1();
    user1 = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    channel1 = channelsCreate(user1.token, 'wego', true);
  });

  afterEach(() => {
    clearV1();
  });

  test('Test standup start with invalid token', () => {
    const response = standUpStart('invalid token', channel1.channelId, 5);
    expect(response).toStrictEqual(403);
  });

  test('Test standup start with invalid channel', () => {
    const response = standUpStart(user1.token, 0, 5);
    expect(response).toStrictEqual(400);
  });
  test('Test standup start with invalid length', () => {
    const response = standUpStart(user1.token, channel1.channelId, -1);
    expect(response).toStrictEqual(400);
  });
  test('Test standup start with user not in channel', () => {
    const user2 = authRegister('aslkdjf@gmail.com', 'alksjdf', 'Kevin', 'asdf');
    const response = standUpStart(user2.token, channel1.channelId, 5);
    expect(response).toStrictEqual(403);
  });
});

describe('Test error cases for standup with async', () => {
  beforeEach(() => {
    clearV1();
  });

  afterEach(() => {
    clearV1();
  });

  test('standup error cases with async ', async () => {
    const user1: AuthReturn = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    const user2: AuthReturn = authRegister(
      'aslkdjf@gmail.com',
      'alksjdf',
      'Kevin',
      'asdf'
    );
    const channel1: { channelId: number } = channelsCreate(
      user1.token,
      'wego',
      true
    );

    standUpStart(user1.token, channel1.channelId, 1);

    // StandUp Start error tests
    expect(standUpStart(user1.token, channel1.channelId, 5)).toStrictEqual(400);

    // Standup Active error tests
    expect(standUpActive('invalid token', channel1.channelId)).toStrictEqual(
      403
    );
    expect(standUpActive(user1.token, 0)).toStrictEqual(400);
    expect(standUpActive(user2.token, channel1.channelId)).toStrictEqual(403);

    // Standup Send error tests
    expect(
      standUpSend('invalid token', channel1.channelId, 'hello')
    ).toStrictEqual(403);
    expect(standUpSend(user1.token, 0, 'hello')).toStrictEqual(400);
    expect(standUpSend(user2.token, channel1.channelId, 'hello')).toStrictEqual(
      403
    );
    expect(standUpSend(user1.token, channel1.channelId, '')).toStrictEqual(400);
    expect(
      standUpSend(user1.token, channel1.channelId, 'a'.repeat(1001))
    ).toStrictEqual(400);

    // standup owner cannot leave while standup running
    expect(channelLeave(user1.token, channel1.channelId)).toStrictEqual(400);

    // wait for standup to end
    await sleep(1);

    // cannot send message
    expect(standUpSend(user1.token, channel1.channelId, 'hello')).toStrictEqual(
      400
    );

    expect(standUpActive(user1.token, channel1.channelId)).toStrictEqual({
      isActive: false,
      timeFinish: 0,
    });
  });

  test('standup then logout should not result in crashing', async () => {
    const user1: AuthReturn = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    const user2: AuthReturn = authRegister(
      'aslkdjf@gmail.com',
      'alksjdf77',
      'Kevin',
      'asdf'
    );
    const channel1: { channelId: number } = channelsCreate(
      user1.token,
      'wego',
      true
    );

    channelJoin(user2.token, channel1.channelId);

    standUpStart(user1.token, channel1.channelId, 1);

    authLogout(user1.token);

    // wait for standup to end
    await sleep(1);

    // check that standUpActive still works
    expect(standUpActive(user2.token, channel1.channelId)).toStrictEqual({
      isActive: false,
      timeFinish: 0,
    });
  });

  test('standup valid test', async () => {
    const user1: AuthReturn = authRegister(
      'kevins050324@gmail.com',
      'kevin1001',
      'Kevin',
      'Sutandi'
    );
    const user2: AuthReturn = authRegister(
      'aslkdjf@gmail.com',
      'alksjdf',
      'Kevin',
      'asdf'
    );
    const channel1: { channelId: number } = channelsCreate(
      user1.token,
      'wego',
      true
    );

    channelJoin(user2.token, channel1.channelId);

    const timeToCompare = Math.floor(new Date().getTime() / 1000) + 1;
    const timeFinish = standUpStart(user1.token, channel1.channelId, 1);

    // check the timeFinish is within 3 seconds
    expect(timeFinish.timeFinish).toBeGreaterThanOrEqual(timeToCompare);
    expect(timeFinish.timeFinish).toBeLessThanOrEqual(timeToCompare + 2);

    // check standup is active
    expect(standUpActive(user1.token, channel1.channelId)).toStrictEqual({
      isActive: true,
      timeFinish: timeFinish.timeFinish,
    });

    // send message
    expect(
      standUpSend(user1.token, channel1.channelId, 'This should be on top')
    ).toStrictEqual({});
    expect(
      standUpSend(user2.token, channel1.channelId, 'This should be on middle')
    ).toStrictEqual({});
    expect(
      standUpSend(user1.token, channel1.channelId, 'This should be on bottom')
    ).toStrictEqual({});

    // wait for standup to end
    await sleep(1);
    expect(standUpActive(user1.token, channel1.channelId)).toStrictEqual({
      isActive: false,
      timeFinish: 0,
    });

    // check message sent
    const messageSent =
      'kevinsutandi: This should be on top\nkevinasdf: This should be on middle\nkevinsutandi: This should be on bottom';
    expect(channelMessage(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: user1.authUserId,
          message: messageSent,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [
            {
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            },
          ],
        },
      ],
      start: 0,
      end: -1,
    });
  });
});
