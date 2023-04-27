import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import {
  findChannel,
  findUser,
  getAllMemberIds,
  getChannelIndex,
  getUserByToken,
  incrementMessageStat,
  forbidden,
  badRequest,
} from './functionHelper';

/**
 *
 * @param token - token of user starting standup
 * @param channelId - channel id of channel to start standup in
 * @param length - length of standup in seconds
 * @returns {timeFinish: number} - timeFinish is the time the standup will finish
 */
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
    throw HTTPError(forbidden, 'Token is invalid');
  }
  if (channel === undefined) {
    throw HTTPError(badRequest, 'Channel does not exist');
  }
  if (allMemberIds.includes(user.authUserId) === false) {
    throw HTTPError(forbidden, 'User is not registered in channel');
  }
  if (length < 0) {
    throw HTTPError(badRequest, 'length should be a positive integer');
  }
  const standUpDeets = standupActiveV1(token, channelId);
  if (standUpDeets.isActive) {
    throw HTTPError(badRequest, 'Standup is already active');
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
    // if token is invalid, do nothing
    try {
      standUpEnd(token, channelId);
    } catch (e) {
      const data = getData();
      const channelIndex = getChannelIndex(channelId);
      const standUp = data.channels[channelIndex].standUp;
      standUp.standUpActive = false;
      standUp.standUpLength = 0;
      standUp.standUpMessage = [];
      standUp.standUpOwner = -1;
      setData(data);
    }
  }, length * 1000);

  return { timeFinish: timeFinish };
}

/**
 *
 * @param token - token of user making request
 * @param channelId - channel id of channel to check standup in
 * @returns {isActive: boolean, timeFinish: number} - isActive is true if standup is active, false otherwise,
 *                                                    timeFinish is the time the standup will finish
 */
export function standupActiveV1(token: string, channelId: number) {
  const user = getUserByToken(token);
  const channel = findChannel(channelId);
  const allMemberIds = getAllMemberIds(channel);

  // Error Checking
  if (user === undefined) {
    throw HTTPError(forbidden, 'Token is invalid');
  }
  if (channel === undefined) {
    throw HTTPError(badRequest, 'Channel does not exist');
  }
  if (allMemberIds.includes(user.authUserId) === false) {
    throw HTTPError(forbidden, 'User is not registered in channel');
  }

  const channelIndex = getChannelIndex(channelId);
  const data = getData();
  const standUp = data.channels[channelIndex].standUp;

  return {
    isActive: standUp.standUpActive,
    timeFinish: standUp.standUpLength,
  };
}

/**
 *
 * @param token - token of user sending message
 * @param channelId - channel id of channel to send message in
 * @param message - message to send
 * @returns {}
 */
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
    throw HTTPError(forbidden, 'Token is invalid');
  }
  if (channel === undefined) {
    throw HTTPError(badRequest, 'Channel does not exist');
  }
  if (allMemberIds.includes(user.authUserId) === false) {
    throw HTTPError(forbidden, 'User is not registered in channel');
  }
  if (message.length < 1) {
    throw HTTPError(badRequest, 'Message is too short');
  }
  if (message.length > 1000) {
    throw HTTPError(badRequest, 'Message is too long');
  }

  const channelIndex = getChannelIndex(channelId);
  const data = getData();

  const standupDeets = standupActiveV1(token, channelId);

  const timeNow = Math.floor(Date.now() / 1000);
  if (timeNow > standupDeets.timeFinish && standupDeets.isActive === false) {
    throw HTTPError(badRequest, 'Standup has finished');
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

/**
 *
 * @param token - token of user
 * @param channelId - id of channel
 * @returns
 */
function standUpEnd(token: string, channelId: number) {
  const channelIndex = getChannelIndex(channelId);
  const user = getUserByToken(token);
  const data = getData();
  const standUp = data.channels[channelIndex].standUp;

  if (user === undefined) {
    throw HTTPError(forbidden, 'Token is invalid');
  }

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

    // join the message together
    message += `${messageSenderHandle}: ${messageContent}\n`;

    // if the message is the last message, delete the last new line
    if (i === messageLength - 1) {
      message = message.slice(0, -1);
    }
  }
  // add new lines in between messages

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
  standUp.standUpOwner = -1;

  setData(data);

  incrementMessageStat(user.authUserId);
}
