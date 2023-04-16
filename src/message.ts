import { getData, setData } from './dataStore';
import {
  findChannel,
  findChannelByMessageId,
  findDMbyId,
  findDMbyMessageId,
  findMessageIndexInChannel,
  findMessageIndexInDM,
  findUserIndex,
  getAllMemberIds,
  getAllOwnerIds,
  getChannelIndex,
  getDmIndex,
  getUserByToken,
} from './functionHelper';
import HTTPError from 'http-errors';
import {
  messages,
  messagesObject,
  newMessageReturn,
  notification,
  reactsObject,
} from './interfaces';

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
  const uIdsReact: Array<number> = [];
  const newMessage = {
    messageId: messageId,
    uId: user.authUserId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
    isPinned: false,
    reacts: [
      {
        reactId: 1,
        uIds: uIdsReact,
        isThisUserReacted: false,
      },
    ],
  };
  data.channels[channelIndex].messages.push(newMessage);

  // send notification if there are users tagged
  // tagged: "{User’s handle} tagged you in {channel/DM name}: {first 20 characters of the message}"
  const taggedUsers = message.match(/@([a-zA-Z0-9_]+)/g);
  if (taggedUsers !== null) {
    const notification: notification = {
      channelId: channelId,
      dmId: -1,
      notificationMessage: `${user.handleStr} tagged you in ${
        channel.name
      }: ${message.slice(0, 20)}`,
    };
    taggedUsers.forEach((taggedUser) => {
      // find the index of the user from handleStr
      const taggedUserIndex = data.users.findIndex(
        (user) => user.handleStr === taggedUser.slice(1)
      );
      data.users[taggedUserIndex].notifications.push(notification);
    });
  }

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
  const uIdsReact: Array<number> = [];
  const newMessage = {
    messageId: messageId,
    uId: user.authUserId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
    isPinned: false,
    reacts: [
      {
        reactId: 1,
        uIds: uIdsReact,
        isThisUserReacted: false,
      },
    ],
  };
  data.dm[dmIndex].messages.push(newMessage);

  const taggedUsers = message.match(/@([a-zA-Z0-9_]+)/g);
  if (taggedUsers !== null) {
    const notification: notification = {
      channelId: -1,
      dmId: dm.dmId,
      notificationMessage: `${user.handleStr} tagged you in ${
        dm.name
      }: ${message.slice(0, 20)}`,
    };
    taggedUsers.forEach((taggedUser) => {
      // find the index of the user from handleStr
      const taggedUserIndex = data.users.findIndex(
        (user) => user.handleStr === taggedUser.slice(1)
      );
      data.users[taggedUserIndex].notifications.push(notification);
    });
  }

  setData(data);
  return { messageId: messageId };
}

/**
 * Given a message within a channel or DM, removes its mark as "pinned".
 * @param {string} token - The token of the user sending the message.
 * @param {number} messageId - The ID of the message to be edited.
 * @returns {{}} - An object containing either an error message or nothing.
 */
export function messagePinV1(
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
    throw HTTPError(400, 'Message Not Found');
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
    if (messageToEdit.isPinned === true) {
      throw HTTPError(400, 'Message is already pinned');
    }
    // only global owner or owner can pin message
    if (
      allOwnerIds.includes(user.authUserId) === false &&
      user.isGlobalOwner === 2
    ) {
      throw HTTPError(403, 'User is neither a global owner nor an owner');
    }

    data.channels[channelIndex].messages[messageIndex].isPinned = true;
  } else {
    const dmIndex = getDmIndex(dm.dmId);
    const messageToEdit = data.dm[dmIndex].messages[messageIndex];
    if (messageToEdit.isPinned === true) {
      throw HTTPError(400, 'Message is already pinned');
    }
    // only owner can pin message
    if (allOwnerIds.includes(user.authUserId) === false) {
      throw HTTPError(403, 'User is not a dm owner');
    }
    data.dm[dmIndex].messages[messageIndex].isPinned = true;
  }

  setData(data);
  return {};
}

/**
 * Given a message within a channel or DM, removes its mark as "pinned".
 * @param {string} token - The token of the user sending the message.
 * @param {number} messageId - The ID of the message to be edited.
 * @returns {{}} - An object containing either an error message or nothing.
 */
export function messageUnpinV1(
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
    throw HTTPError(400, 'Message Not Found');
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
    if (messageToEdit.isPinned === false) {
      throw HTTPError(400, 'Message is not pinned');
    }
    // only global owner or owner can unpin message
    if (
      allOwnerIds.includes(user.authUserId) === false &&
      user.isGlobalOwner === 2
    ) {
      throw HTTPError(403, 'User is neither a global owner nor an owner');
    }

    data.channels[channelIndex].messages[messageIndex].isPinned = false;
  } else {
    const dmIndex = getDmIndex(dm.dmId);
    const messageToEdit = data.dm[dmIndex].messages[messageIndex];
    if (messageToEdit.isPinned === false) {
      throw HTTPError(400, 'Message is not pinned');
    }
    // only owner can pin message
    if (allOwnerIds.includes(user.authUserId) === false) {
      throw HTTPError(403, 'User is not a dm owner');
    }
    data.dm[dmIndex].messages[messageIndex].isPinned = false;
  }
  setData(data);
  return {};
}

/**
 * Given a query substring, returns a collection of messages in all of the channels/DMs that the user has joined that contain the query (case-insensitive). There is no expected order for these messages.
 * @param token - The token of the user sending the message.
 * @param queryStr - queryStr
 */
export function searchV1(token: string, queryStr: string): messages {
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid');
  }

  if (queryStr.length < 1) {
    throw HTTPError(400, 'Query is too short');
  } else if (queryStr.length > 1000) {
    throw HTTPError(400, 'Query is too long');
  }

  const data = getData();
  // search through all channels or dms that the user is part of
  const allChannels = data.channels;
  const allDms = data.dm;
  const allMessages: messagesObject[] = [];

  for (const channel of allChannels) {
    for (const message of channel.messages) {
      if (message.message.includes(queryStr)) {
        // put message in array
        allMessages.push(message);
      }
    }
  }

  for (const dm of allDms) {
    for (const message of dm.messages) {
      if (message.message.includes(queryStr)) {
        // put message in array
        allMessages.push(message);
      }
    }
  }

  const start = 0;
  const end = allMessages.length;
  const allMessagesObject: messages = {
    start,
    end,
    messages: allMessages,
  };

  return allMessagesObject;
}

export function notificationsGetV1(token: string) {
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid');
  }

  const data = getData();
  const userIndex = findUserIndex(user.authUserId);
  const notifications = data.users[userIndex].notifications;
  notifications.reverse();
  const notificationsSliced = notifications.slice(0, 20);
  return { notifications: notificationsSliced };
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

  const currentTime = Math.floor(Date.now() / 1000);
  if (timeSent < currentTime) {
    throw HTTPError(400, 'Time sent cannot be a time in the past');
  }

  const channelIndex = getChannelIndex(channelId);
  const messageId = Math.floor(Math.random() * 1000000);
  const uIdsReact = [] as Array<number>;

  const timeDelay = timeSent - currentTime;
  setTimeout(() => {
    const newMessage = {
      messageId: messageId,
      uId: user.authUserId,
      message: message,
      timeSent: Math.floor(Date.now() / 1000),
      isPinned: false,
      reacts: [
        {
          reactId: 1,
          uIds: uIdsReact,
          isThisUserReacted: false,
        },
      ],
    };
    data.channels[channelIndex].messages.push(newMessage);
    setData(data);
  }, timeDelay * 1000);

  return { messageId: messageId };
}

export function messageSendLaterDmV1(
  token: string,
  dmId: number,
  message: string,
  timeSent: number
) {
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

  const currentTime = Math.floor(Date.now() / 1000);
  if (timeSent < currentTime) {
    throw HTTPError(400, 'Time sent cannot be a time in the past');
  }

  const dmIndex = getDmIndex(dmId);
  const messageId = Math.floor(Math.random() * 1000000);

  const timeDelay = timeSent - currentTime;
  setTimeout(() => {
    const newMessage = {
      messageId: messageId,
      uId: user.authUserId,
      message: message,
      timeSent: Math.floor(Date.now() / 1000),
      isPinned: false,
      reacts: [] as Array<reactsObject>,
    };
    data.dm[dmIndex].messages.push(newMessage);
    setData(data);
  }, timeDelay * 1000);
  return { messageId: messageId };
}

export function messageShareV1(
  token: string,
  ogMessageId: number,
  message: string,
  channelId: number,
  dmId: number
) {
  const data = getData();
  const user = getUserByToken(token);
  const channel = findChannelByMessageId(ogMessageId);
  const dm = findDMbyMessageId(ogMessageId);
  const channelTargetIndex = getChannelIndex(channelId);
  const dmTargetIndex = getDmIndex(dmId);
  let messageIndex = -1;
  let flags;

  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  if (channelTargetIndex === -1 && dmTargetIndex === -1) {
    throw HTTPError(400, 'Invalid channelId and dmId');
  }

  // Finds the message's location
  if (channel === undefined && dm === undefined) {
    throw HTTPError(400, 'Message does not exist');
  } else if (channel !== undefined) {
    messageIndex = findMessageIndexInChannel(channel, ogMessageId);
    flags = channel;
  } else {
    messageIndex = findMessageIndexInDM(dm, ogMessageId);
    flags = dm;
  }

  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'Neither channelId nor dmId are -1');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'Message cannot exceed 1000 characters');
  }

  let allMemberIds = getAllMemberIds(flags);
  if (!allMemberIds.includes(user.authUserId)) {
    throw HTTPError(400, 'You cannot share message from this');
  }

  const sharedMessageId = Math.floor(Math.random() * 1000000);
  // Shares the message to a channel
  if (channelId !== -1) {
    allMemberIds = getAllMemberIds(data.channels[channelTargetIndex]);
    if (!allMemberIds.includes(user.authUserId)) {
      throw HTTPError(403, 'You cannot share message to this channel');
    }
    const newMessage = {
      messageId: sharedMessageId,
      uId: user.authUserId,
      message: flags.messages[messageIndex].message + ' ' + message,
      timeSent: Math.floor(Date.now() / 1000),
      isPinned: false,
      reacts: [] as Array<reactsObject>,
    };
    data.channels[channelTargetIndex].messages.push(newMessage);
    setData(data);
    return { sharedMessageId: sharedMessageId };

    // Shares the message to a dm
  } else {
    allMemberIds = getAllMemberIds(data.dm[dmTargetIndex]);
    if (!allMemberIds.includes(user.authUserId)) {
      throw HTTPError(403, 'You cannot share message to this dm');
    }
    const newMessage = {
      messageId: sharedMessageId,
      uId: user.authUserId,
      message: flags.messages[messageIndex].message + ' ' + message,
      timeSent: Math.floor(Date.now() / 1000),
      isPinned: false,
      reacts: [] as Array<reactsObject>,
    };
    data.dm[dmTargetIndex].messages.push(newMessage);
    setData(data);
    return { sharedMessageId: sharedMessageId };
  }
}

export function messageReactV1(token: string, messageId: number, reactId: number) {

  return {};
}
