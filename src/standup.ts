import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import {
  findChannel,
  findUser,
  getAllMemberIds,
  getChannelIndex,
  getUserByToken,
} from './functionHelper';

export function standupStartV1(
  token: string,
  channelId: number,
  length: number
) {
  const user = getUserByToken(token);
  const channel = findChannel(channelId);
  const allMemberIds = getAllMemberIds(channel);

  // Error Checking
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (channel === undefined) {
    throw HTTPError(400, 'Channel does not exist');
  }
  if (allMemberIds.includes(user.authUserId) === false) {
    throw HTTPError(403, 'User is not registered in channel');
  }
  if (length < 0) {
    throw HTTPError(400, 'length should be a positive integer');
  }
  const standUpDeets = standupActiveV1(token, channelId);
  if (standUpDeets.isActive) {
    throw HTTPError(400, 'Standup is already active');
  }

  const timeFinish = Math.floor(Date.now() / 1000) + length;

  const channelIndex = getChannelIndex(channelId);
  const data = getData();
  data.channels[channelIndex].standUp.standUpActive = true;
  data.channels[channelIndex].standUp.standUpLength = timeFinish;
  data.channels[channelIndex].standUp.standUpOwner = user.authUserId;

  setData(data);

  // timeout
  setTimeout(() => {
    standUpEnd(token, channelId);
  }, length * 1000);

  return { timeFinish: timeFinish };
}

export function standupActiveV1(token: string, channelId: number) {
  const user = getUserByToken(token);
  const channel = findChannel(channelId);
  const allMemberIds = getAllMemberIds(channel);

  // Error Checking
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (channel === undefined) {
    throw HTTPError(400, 'Channel does not exist');
  }
  if (allMemberIds.includes(user.authUserId) === false) {
    throw HTTPError(403, 'User is not registered in channel');
  }

  const channelIndex = getChannelIndex(channelId);
  const data = getData();
  const standUp = data.channels[channelIndex].standUp;

  return {
    isActive: standUp.standUpActive,
    timeFinish: standUp.standUpLength,
  };
}

export function standupSendV1(
  token: string,
  channelId: number,
  message: string
) {
  const user = getUserByToken(token);
  const channel = findChannel(channelId);
  const allMemberIds = getAllMemberIds(channel);

  // Error Checking
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (channel === undefined) {
    throw HTTPError(400, 'Channel does not exist');
  }
  if (allMemberIds.includes(user.authUserId) === false) {
    throw HTTPError(403, 'User is not registered in channel');
  }
  if (message.length < 1) {
    throw HTTPError(400, 'Message is too short');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'Message is too long');
  }

  const channelIndex = getChannelIndex(channelId);
  const data = getData();

  const standupDeets = standupActiveV1(token, channelId);

  const timeNow = Math.floor(Date.now() / 1000);
  if (timeNow > standupDeets.timeFinish && standupDeets.isActive === false) {
    throw HTTPError(400, 'Standup has finished');
  }

  const newMessage = {
    messageId: Math.floor(Math.random() * 1000000),
    uId: user.authUserId,
    message: message,
    timeSent: timeNow,
    isPinned: false,
    reacts: [
      {
        reactId: 1,
        uIds: [] as number[],
        isThisUserReacted: false,
      },
    ],
  };

  data.channels[channelIndex].standUp.standUpMessage.push(newMessage);
  setData(data);

  return {};
}

function standUpEnd(token: string, channelId: number) {
  const channelIndex = getChannelIndex(channelId);
  const user = getUserByToken(token);
  const data = getData();
  const standUp = data.channels[channelIndex].standUp;

  if (standUp.standUpMessage.length === 0) {
    standUp.standUpActive = false;
    standUp.standUpLength = 0;
    standUp.standUpMessage = [];
    setData(data);
    return;
  }

  let message = '';
  const messageLength = standUp.standUpMessage.length;
  for (let i = 0; i < messageLength; i++) {
    const messageSender = standUp.standUpMessage[i].uId;
    const user = findUser(messageSender);
    const messageSenderHandle = user.handleStr;
    const messageContent = standUp.standUpMessage[i].message;

    message += `${messageSenderHandle}: ${messageContent}\n`;
  }

  const newMessage = {
    messageId: Math.floor(Math.random() * 1000000),
    uId: user.authUserId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
    isPinned: false,
    reacts: [
      {
        reactId: 1,
        uIds: [] as number[],
        isThisUserReacted: false,
      },
    ],
  };

  data.channels[channelIndex].messages.push(newMessage);

  standUp.standUpActive = false;
  standUp.standUpLength = 0;
  standUp.standUpMessage = [];

  setData(data);
}
