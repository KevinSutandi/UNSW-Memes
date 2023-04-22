import {
  authRegister,
  usersAll,
  clearV1,
  userProfileUploadPhoto,
  setHandle,
  setEmail,
  setName,
  userProfile,
  channelsCreate,
  dmCreate,
  channelJoin,
  channelDetails,
  dmDetails,
  channelAddOwner,
  userStats,
  messageSend,
  channelLeave,
  messageSendDm,
  standUpStart,
  standUpSend,
  messageShare,
  messageSendLater,
  messageSendLaterDm,
  dmRemove,
  dmLeave,
  channelInvite,
  usersStats,
} from './httpHelper';
import { AuthReturn } from './interfaces';
import { port } from './config.json';
import { getCurrentTime } from './functionHelper';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms * 1000));
}

const badrequest = 400;
const forbidden = 403;

describe('userProfile iteration 3 testing', () => {
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
  afterEach(() => {
    clearV1();
  });

  test('userProfile setHandlerv2', () => {
    expect(setHandle('', 'Batman')).toStrictEqual(forbidden);
    expect(setHandle(user2.token, '')).toStrictEqual(badrequest);
    expect(setHandle(user2.token, '@@@')).toStrictEqual(badrequest);
    expect(
      setHandle(
        user2.token,
        '111111111111111111111111111111111111111111111111111111'
      )
    ).toStrictEqual(badrequest);

    setHandle(user2.token, 'Batman');
    expect(setHandle(user2.token, 'Batman')).toStrictEqual(badrequest);
    expect(userProfile(user2.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'testing12347@gmail.com',
        nameFirst: 'Almina',
        nameLast: 'Kova',
        handleStr: 'Batman',
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('userProfile setEmail', () => {
    expect(setEmail('', '12')).toStrictEqual(forbidden);
    expect(setEmail(user2.token, '12')).toStrictEqual(badrequest);

    setEmail(user.token, 'onlyfortestttt9@gmail.com');
    expect(setEmail(user2.token, 'onlyfortestttt9@gmail.com')).toStrictEqual(
      badrequest
    );
    expect(userProfile(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'onlyfortestttt9@gmail.com',
        nameFirst: 'Jonah',
        nameLast: 'Meggs',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('userProfile setName', () => {
    expect(setName('', '12', '12')).toStrictEqual(forbidden);
    expect(setName(user2.token, '', '')).toStrictEqual(badrequest);

    expect(setName(user2.token, 'Jonah', 'Meggs')).toStrictEqual({});
    expect(userProfile(user2.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'testing12347@gmail.com',
        nameFirst: 'Jonah',
        nameLast: 'Meggs',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('userProfile userprofile', () => {
    expect(userProfile('', user.authUserId)).toStrictEqual(forbidden);
    expect(userProfile(user.token, 1000000)).toStrictEqual(badrequest);

    expect(userProfile(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'onlyfortestttt06@gmail.com',
        nameFirst: 'Jonah',
        nameLast: 'Meggs',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('getAllUsers invalid Token', () => {
    expect(usersAll('wrong token')).toStrictEqual(forbidden);
  });

  test('getAllUsers  run success', () => {
    expect(usersAll(user.token)).toStrictEqual({
      users: [
        {
          uId: user.authUserId,
          email: 'onlyfortestttt06@gmail.com',
          nameFirst: 'Jonah',
          nameLast: 'Meggs',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        },
        {
          uId: user2.authUserId,
          email: 'testing12347@gmail.com',
          nameFirst: 'Almina',
          nameLast: 'Kova',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});

describe('userProfileUploadPhoto testing', () => {
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

  const validImgUrl = 'http://i.redd.it/v0caqchbtn741.jpg';
  const invalidPNG = 'https://i.imgur.com/2SbRPiD.jpeg';
  const invalid404 = 'https://imgur.com/F9Nf9FKSLJDFHKJLx.jpg';

  test('userProfileUploadPhoto invalid Token', () => {
    expect(
      userProfileUploadPhoto('wrong token', validImgUrl, 0, 0, 200, 200)
    ).toStrictEqual(403);
  });

  test('userProfileUploadPhoto invalid image url (not jpg)', () => {
    expect(
      userProfileUploadPhoto(user.token, invalidPNG, 0, 0, 200, 200)
    ).toStrictEqual(400);
  });

  test('userProfileUploadPhoto invalid image url (404)', () => {
    expect(
      userProfileUploadPhoto(user.token, invalid404, 0, 0, 200, 200)
    ).toStrictEqual(400);
  });

  test('invalid dimensions', () => {
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 0, 0)
    ).toStrictEqual(400);
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 300, 300, 0, 0)
    ).toStrictEqual(400);
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 900, 900)
    ).toStrictEqual(400);
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 200, 900)
    ).toStrictEqual(400);
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 900, 200)
    ).toStrictEqual(400);
  });

  test('userProfileUploadPhoto run success', () => {
    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 200, 200)
    ).toStrictEqual({});
  });

  test('userProfileUploadPhoto run success and updates in channels and dm', () => {
    const user2: AuthReturn = authRegister(
      'wego@gm.com',
      'testpw0005',
      'Almina',
      'Kova'
    );
    const channel1 = channelsCreate(user.token, 'channel1', true);
    channelJoin(user2.token, channel1.channelId);
    channelAddOwner(user.token, channel1.channelId, user2.authUserId);
    const dm1 = dmCreate(user.token, [user2.authUserId]);
    const dm2 = dmCreate(user2.token, [user.authUserId]);
    const PORT: number = parseInt(process.env.PORT || port);
    const HOST: string = process.env.IP || 'localhost';

    expect(
      userProfileUploadPhoto(user.token, validImgUrl, 0, 0, 200, 200)
    ).toStrictEqual({});

    expect(
      channelDetails(user.token, channel1.channelId).ownerMembers[0]
        .profileImgUrl
    ).not.toStrictEqual(`http://${HOST}:${PORT}/img/default.jpg`);
    expect(
      channelDetails(user.token, channel1.channelId).ownerMembers[1]
        .profileImgUrl
    ).toStrictEqual(`http://${HOST}:${PORT}/img/default.jpg`);
    expect(
      channelDetails(user.token, channel1.channelId).allMembers[0].profileImgUrl
    ).not.toStrictEqual(`http://${HOST}:${PORT}/img/default.jpg`);
    expect(
      channelDetails(user.token, channel1.channelId).allMembers[1].profileImgUrl
    ).toStrictEqual(`http://${HOST}:${PORT}/img/default.jpg`);

    expect(
      dmDetails(user.token, dm1.dmId).members[0].profileImgUrl
    ).not.toStrictEqual(`http://${HOST}:${PORT}/img/default.jpg`);
    expect(
      dmDetails(user.token, dm1.dmId).members[1].profileImgUrl
    ).toStrictEqual(`http://${HOST}:${PORT}/img/default.jpg`);

    expect(
      dmDetails(user2.token, dm2.dmId).members[0].profileImgUrl
    ).toStrictEqual(`http://${HOST}:${PORT}/img/default.jpg`);

    expect(
      dmDetails(user2.token, dm2.dmId).members[1].profileImgUrl
    ).not.toStrictEqual(`http://${HOST}:${PORT}/img/default.jpg`);
  });
});

describe('userStatsV1 testing', () => {
  let user: AuthReturn;

  beforeEach(() => {
    clearV1();
    user = authRegister('kevin@gmail.com', 'testpw0005', 'Kevin', 'Sutandi');
  });

  afterEach(() => {
    clearV1();
  });

  test('userStatsV1 invalid Token', () => {
    expect(userStats('wrong token')).toStrictEqual(forbidden);
  });

  test('userStatsV1 involvment updated and return type correct', () => {
    const user2: AuthReturn = authRegister(
      'kevinnn@gm.com',
      'testpw0005',
      'Almina',
      'Kova'
    );

    let channelJoined = 0;
    let dmJoined = 0;
    let messageSent = 0;
    let channelCounter = 0;
    let dmCounter = 0;
    let messageCounter = 0;

    const channel1 = channelsCreate(user.token, 'channel1', true);
    channelCounter++;
    channelJoined++;
    const channel2 = channelsCreate(user.token, 'channel2', true);
    channelLeave(user.token, channel2.channelId);
    channelCounter++;
    const channel3 = channelsCreate(user.token, 'channel3', true);
    channelLeave(user.token, channel3.channelId);
    channelCounter++;
    const dm1 = dmCreate(user.token, []);
    dmCounter++;
    dmJoined++;
    dmCreate(user.token, []);
    dmCounter++;
    dmJoined++;
    messageSend(user.token, channel1.channelId, 'message1');
    messageCounter++;
    messageSent++;
    messageSend(user.token, channel1.channelId, 'message2');
    messageCounter++;
    messageSent++;
    messageSendDm(user.token, dm1.dmId, 'message1');
    messageCounter++;
    messageSent++;
    channelJoin(user2.token, channel1.channelId);
    messageSend(user2.token, channel1.channelId, 'message1');
    messageCounter++;

    const involvement =
      (channelJoined + dmJoined + messageSent) /
      (channelCounter + dmCounter + messageCounter);

    expect(userStats(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: expect.any(Array),
        dmsJoined: expect.any(Array),
        messagesSent: expect.any(Array),
        involvementRate: involvement,
      },
    });
  });

  test('message increments when standup ends', async () => {
    const user2: AuthReturn = authRegister(
      'aslkdjf@gmail.com',
      'alksjdf',
      'Kevin',
      'asdf'
    );
    const channel1: { channelId: number } = channelsCreate(
      user.token,
      'wego',
      true
    );

    channelJoin(user2.token, channel1.channelId);

    standUpStart(user.token, channel1.channelId, 1);

    // send message
    expect(
      standUpSend(user.token, channel1.channelId, 'This should be on top')
    ).toStrictEqual({});
    expect(
      standUpSend(user2.token, channel1.channelId, 'This should be on middle')
    ).toStrictEqual({});
    expect(
      standUpSend(user.token, channel1.channelId, 'This should be on bottom')
    ).toStrictEqual({});

    // wait for standup to end
    await sleep(1);

    // expect a message increment
    expect(
      userStats(user.token).userStats.messagesSent[1].numMessagesSent
    ).toStrictEqual(1);
  });

  test('message increments when sharing message', () => {
    const channel1: { channelId: number } = channelsCreate(
      user.token,
      'wego',
      true
    );

    const channel2: { channelId: number } = channelsCreate(
      user.token,
      'wego2',
      true
    );

    const message1 = messageSend(user.token, channel1.channelId, 'message1');

    messageShare(user.token, message1.messageId, '', channel2.channelId, -1);

    expect(
      userStats(user.token).userStats.messagesSent[2].numMessagesSent
    ).toStrictEqual(2);
  });

  test('message increments when using sendLater and sendLaterDm', async () => {
    const channel1: { channelId: number } = channelsCreate(
      user.token,
      'wego',
      true
    );

    const dm1: { dmId: number } = dmCreate(user.token, []);

    messageSendLater(
      user.token,
      channel1.channelId,
      'message1',
      getCurrentTime() + 1
    );

    await sleep(1);

    messageSendLaterDm(user.token, dm1.dmId, 'message1', getCurrentTime() + 1);

    await sleep(1);

    expect(
      userStats(user.token).userStats.messagesSent[2].numMessagesSent
    ).toStrictEqual(2);
  });

  test('message increments when using send and sendDm', () => {
    const channel1 = channelsCreate(user.token, 'channel1', true);
    const dm1 = dmCreate(user.token, []);

    messageSend(user.token, channel1.channelId, 'message1');

    messageSendDm(user.token, dm1.dmId, 'message1');

    expect(userStats(user.token).userStats.messagesSent.length).toStrictEqual(
      3
    );
  });

  test('Dms decremented when leaving', () => {
    const dm1 = dmCreate(user.token, []);
    dmLeave(user.token, dm1.dmId);
    expect(
      userStats(user.token).userStats.dmsJoined[2].numDmsJoined
    ).toStrictEqual(0);
  });

  test('Dms incremented when creating', () => {
    dmCreate(user.token, []);
    expect(
      userStats(user.token).userStats.dmsJoined[1].numDmsJoined
    ).toStrictEqual(1);
  });

  test('Dms decremented when removed', () => {
    const user2: AuthReturn = authRegister(
      'kevvv@gm.com',
      'testpw0005',
      'Almina',
      'Kova'
    );

    const dm1 = dmCreate(user.token, [user2.authUserId]);

    expect(
      userStats(user.token).userStats.dmsJoined[1].numDmsJoined
    ).toStrictEqual(1);
    expect(
      userStats(user2.token).userStats.dmsJoined[1].numDmsJoined
    ).toStrictEqual(1);

    dmRemove(user.token, dm1.dmId);

    expect(
      userStats(user.token).userStats.dmsJoined[2].numDmsJoined
    ).toStrictEqual(0);
    expect(
      userStats(user2.token).userStats.dmsJoined[2].numDmsJoined
    ).toStrictEqual(0);
  });

  test('channels incremented when creating', () => {
    channelsCreate(user.token, 'channel1', true);
    expect(
      userStats(user.token).userStats.channelsJoined[1].numChannelsJoined
    ).toStrictEqual(1);
  });

  test('channels decremented when leaving', () => {
    const channel1 = channelsCreate(user.token, 'channel1', true);
    channelLeave(user.token, channel1.channelId);
    expect(
      userStats(user.token).userStats.channelsJoined[2].numChannelsJoined
    ).toStrictEqual(0);
  });

  test('channels incremented when joining', () => {
    const user2 = authRegister('kevins@gm.com', 'testpw0005', 'KEVVVV', 'Kova');

    const channel1 = channelsCreate(user.token, 'channel1', true);

    channelJoin(user2.token, channel1.channelId);

    expect(
      userStats(user2.token).userStats.channelsJoined[1].numChannelsJoined
    ).toStrictEqual(1);
  });

  test('channels incremented when invited', () => {
    const user2 = authRegister('kevins@gm.com', 'testpw0005', 'KEVVVV', 'Kova');

    const channel1 = channelsCreate(user.token, 'channel1', true);

    channelInvite(user.token, channel1.channelId, user2.authUserId);

    expect(
      userStats(user2.token).userStats.channelsJoined[1].numChannelsJoined
    ).toStrictEqual(1);
  });
});

describe('workspaceStats tests', () => {
  let user: AuthReturn;

  beforeEach(() => {
    clearV1();
    user = authRegister('kevin@gmail.com', 'testpw0005', 'Kevin', 'Sutandi');
  });

  afterEach(() => {
    clearV1();
  });

  test('workspaceStats invalid token', () => {
    expect(usersStats('invalid token')).toStrictEqual(forbidden);
  });

  test('workspaceStats utilization rate updated', () => {
    channelsCreate(user.token, 'channel1', true);
    channelsCreate(user.token, 'channel2', true);
    channelsCreate(user.token, 'channel3', true);

    authRegister('kev@gmm.com', 'testpw0005', 'KEVVVV', 'Kova');

    expect(usersStats(user.token).workspaceStats.utilizationRate).toStrictEqual(
      0.5
    );
  });

  test('message increments when sharing message', () => {
    const channel1: { channelId: number } = channelsCreate(
      user.token,
      'wego',
      true
    );

    const channel2: { channelId: number } = channelsCreate(
      user.token,
      'wego2',
      true
    );

    const message1 = messageSend(user.token, channel1.channelId, 'message1');

    messageShare(user.token, message1.messageId, '', channel2.channelId, -1);

    expect(
      usersStats(user.token).workspaceStats.messagesExist[2].numMessagesExist
    ).toStrictEqual(2);
  });

  test('message increments when using sendLater and sendLaterDm', async () => {
    const channel1: { channelId: number } = channelsCreate(
      user.token,
      'wego',
      true
    );

    const dm1: { dmId: number } = dmCreate(user.token, []);

    messageSendLater(
      user.token,
      channel1.channelId,
      'message1',
      getCurrentTime() + 1
    );

    await sleep(1);

    messageSendLaterDm(user.token, dm1.dmId, 'message1', getCurrentTime() + 1);

    await sleep(1);

    expect(
      usersStats(user.token).workspaceStats.messagesExist[2].numMessagesExist
    ).toStrictEqual(2);
  });

  test('message increments when using send and sendDm', () => {
    const channel1 = channelsCreate(user.token, 'channel1', true);
    const dm1 = dmCreate(user.token, []);

    messageSend(user.token, channel1.channelId, 'message1');

    messageSendDm(user.token, dm1.dmId, 'message1');

    expect(
      usersStats(user.token).workspaceStats.messagesExist[2].numMessagesExist
    ).toStrictEqual(2);
  });

  test('Dms should not decrement when leaving', () => {
    const dm1 = dmCreate(user.token, []);
    dmLeave(user.token, dm1.dmId);
    expect(
      usersStats(user.token).workspaceStats.dmsExist[1].numDmsExist
    ).toStrictEqual(1);
  });

  test('Dms incremented when creating', () => {
    dmCreate(user.token, []);
    expect(
      usersStats(user.token).workspaceStats.dmsExist[1].numDmsExist
    ).toStrictEqual(1);
  });

  test('Dms decremented when removed', () => {
    const user2: AuthReturn = authRegister(
      'kevvv@gm.com',
      'testpw0005',
      'Almina',
      'Kova'
    );

    const dm1 = dmCreate(user.token, [user2.authUserId]);

    expect(
      usersStats(user.token).workspaceStats.dmsExist[1].numDmsExist
    ).toStrictEqual(1);
    expect(
      usersStats(user2.token).workspaceStats.dmsExist[1].numDmsExist
    ).toStrictEqual(1);

    dmRemove(user.token, dm1.dmId);

    expect(
      usersStats(user.token).workspaceStats.dmsExist[2].numDmsExist
    ).toStrictEqual(0);
    expect(
      usersStats(user2.token).workspaceStats.dmsExist[2].numDmsExist
    ).toStrictEqual(0);
  });

  test('channels incremented when creating', () => {
    channelsCreate(user.token, 'channel1', true);
    expect(
      usersStats(user.token).workspaceStats.channelsExist[1].numChannelsExist
    ).toStrictEqual(1);
  });

  test('channels not decremented when leaving', () => {
    const channel1 = channelsCreate(user.token, 'channel1', true);
    channelLeave(user.token, channel1.channelId);
    expect(
      usersStats(user.token).workspaceStats.channelsExist[1].numChannelsExist
    ).toStrictEqual(1);
    expect(
      usersStats(user.token).workspaceStats.channelsExist.length
    ).toStrictEqual(2);
  });
});
