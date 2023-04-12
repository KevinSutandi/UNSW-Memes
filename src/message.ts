import { getData, setData } from './dataStore';
import {
  findChannel,
  findChannelByMessageId,
  findDMbyId,
  findDMbyMessageId,
  findMessageIndexInChannel,
  findMessageIndexInDM,
  getAllMemberIds,
  getAllOwnerIds,
  getChannelIndex,
  getDmIndex,
  getUserByToken,
} from './functionHelper';
import { newMessageReturn } from './interfaces';
import HTTPError from 'http-errors';

/**
 *
 * @param {string} token - The token of the user sending the message.
 * @param {number} channelId - The ID of the channel to send the message to.
 * @param {string} message - The message to be sent.
 * @returns {} - An object containing either an error message or the ID of the sent message.
 */
export function messageSendV1(
  token: string,
  channelId: number,
  message: string
): newMessageReturn {
  const data = getData();
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
  const messageId = Math.floor(Math.random() * 1000000);
  const newMessage = {
    messageId: messageId,
    uId: user.authUserId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
  };
  data.channels[channelIndex].messages.push(newMessage);
  setData(data);
  return { messageId: messageId };
}
/**
 *
 * @param {string} token - The token of the user removing the message.
 * @param {number} messageId - The ID of the message to be removed.
 * @returns {} - An object containing either an error message or nothing.
 */
export function messageRemoveV1(
  token: string,
  messageId: number
): Record<string, never> {
  const data = getData();
  const user = getUserByToken(token);
  const channel = findChannelByMessageId(messageId);
  const dm = findDMbyMessageId(messageId);
  let messageIndex = -1;
  let flags;

  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid');
  }

  if (channel === undefined && dm === undefined) {
    throw HTTPError(400, 'Message does not exist');
  } else if (channel !== undefined) {
    messageIndex = findMessageIndexInChannel(channel, messageId);
    flags = channel;
  } else {
    messageIndex = findMessageIndexInDM(dm, messageId);
    flags = dm;
  }

  const allMemberIds = getAllMemberIds(flags);
  const allOwnerIds = getAllOwnerIds(flags);

  if (allMemberIds.includes(user.authUserId) === false) {
    throw HTTPError(403, 'User is not registered in channel');
  }

  if (flags === channel) {
    const channelIndex = getChannelIndex(channel.channelId);
    const messageToEdit = data.channels[channelIndex].messages[messageIndex];

    if (
      messageToEdit.uId !== user.authUserId &&
      allOwnerIds.includes(user.authUserId) === false &&
      user.isGlobalOwner === 2
    ) {
      throw HTTPError(
        403,
        'User is not the author of the message and not an owner'
      );
    }

    data.channels[channelIndex].messages.splice(messageIndex, 1);
    setData(data);
    return {};
  } else {
    const dmIndex = getDmIndex(dm.dmId);
    const messageToEdit = data.dm[dmIndex].messages[messageIndex];

    if (
      messageToEdit.uId !== user.authUserId &&
      allOwnerIds.includes(user.authUserId) === false
    ) {
      throw HTTPError(403, 'User is not the author of the message');
    }

    data.dm[dmIndex].messages.splice(messageIndex, 1);
    setData(data);
    return {};
  }
}

/**
 *
 * @param {string} token - The token of the user editing the message.
 * @param {number} messageId - The ID of the message to be edited.
 * @param {string} message - The new message.
 * @returns {} - An object containing either an error message or nothing.
 */
export function messageEditV1(
  token: string,
  messageId: number,
  message: string
): Record<string, never> {
  const data = getData();
  const user = getUserByToken(token);
  const channel = findChannelByMessageId(messageId);
  const dm = findDMbyMessageId(messageId);
  let messageIndex = -1;
  let flags;

  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid');
  }

  if (channel === undefined && dm === undefined) {
    throw HTTPError(400, 'Message does not exist');
  } else if (channel !== undefined) {
    messageIndex = findMessageIndexInChannel(channel, messageId);
    flags = channel;
  } else {
    messageIndex = findMessageIndexInDM(dm, messageId);
    flags = dm;
  }

  const allMemberIds = getAllMemberIds(flags);
  const allOwnerIds = getAllOwnerIds(flags);

  if (allMemberIds.includes(user.authUserId) === false) {
    throw HTTPError(403, 'User is not registered in channel');
  }

  if (flags === channel) {
    const channelIndex = getChannelIndex(channel.channelId);
    const messageToEdit = data.channels[channelIndex].messages[messageIndex];

    if (
      messageToEdit.uId !== user.authUserId &&
      allOwnerIds.includes(user.authUserId) === false &&
      user.isGlobalOwner === 2
    ) {
      throw HTTPError(
        403,
        'User is not the author of the message and not an owner'
      );
    }

    // Delets message if message is empty
    if (message.length < 1) {
      data.channels[channelIndex].messages.splice(messageIndex, 1);
      setData(data);
      return {};
    }
    if (message.length > 1000) {
      throw HTTPError(400, 'Message is too long');
    }

    data.channels[channelIndex].messages[messageIndex].message = message;
    setData(data);
    return {};
  } else {
    const dmIndex = getDmIndex(dm.dmId);
    const messageToEdit = data.dm[dmIndex].messages[messageIndex];

    if (
      messageToEdit.uId !== user.authUserId &&
      allOwnerIds.includes(user.authUserId) === false
    ) {
      throw HTTPError(403, 'User is not the author of the message');
    }

    // Delets message if message is empty
    if (message.length < 1) {
      data.dm[dmIndex].messages.splice(messageIndex, 1);
      setData(data);
      return {};
    }
    if (message.length > 1000) {
      throw HTTPError(400, 'Message is too long');
    }

    data.dm[dmIndex].messages[messageIndex].message = message;
    setData(data);
    return {};
  }
}

/**
 *
 * @param {string} token - The token of the user sending the message.
 * @param {number} dmId - The ID of the DM to send the message to.
 * @param {string} message - The message to be sent.
 * @returns {messageId : number} - An object containing the ID of the message sent.
 */
export function messageSendDmV1(
  token: string,
  dmId: number,
  message: string
): newMessageReturn {
  const data = getData();
  const user = getUserByToken(token);
  const dm = findDMbyId(dmId);
  const allMemberIds = getAllMemberIds(dm);

  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (dm === undefined) {
    throw HTTPError(400, 'DM does not exist');
  }
  if (allMemberIds.includes(user.authUserId) === false) {
    throw HTTPError(403, 'User is not registered in DM');
  }
  if (message.length < 1) {
    throw HTTPError(400, 'Message is too short');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'Message is too long');
  }

  const dmIndex = getDmIndex(dmId);
  const messageId = Math.floor(Math.random() * 1000000);
  const newMessage = {
    messageId: messageId,
    uId: user.authUserId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
  };
  data.dm[dmIndex].messages.push(newMessage);
  setData(data);
  return { messageId: messageId };
}

export function messageSendLaterV1(
  token: string,
  channelId: number,
  message: string,
  timeSent: number
) {
  const data = getData();
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

  const currentTime = new Date().getTime();
  if (timeSent < currentTime) {
    throw HTTPError(400, 'Time sent cannot be a time in the past');
  }

  const channelIndex = getChannelIndex(channelId);
  const messageId = Math.floor(Math.random() * 1000000);

  const timeDelay = timeSent - currentTime;
  setTimeout(() => {
    const newMessage = {
      messageId: messageId,
      uId: user.authUserId,
      message: message,
      timeSent: Math.floor(Date.now() / 1000),
    };
    data.channels[channelIndex].messages.push(newMessage);
  }, timeDelay);

  setData(data);
  return { messageId: messageId };
}
