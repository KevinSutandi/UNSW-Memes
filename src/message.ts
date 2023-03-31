import { getData, setData } from './dataStore';
import {
  findChannel,
  findChannelByMessageId,
  findDMbyMessageId,
  findMessageIndexInChannel,
  findMessageIndexInDM,
  getAllMemberIds,
  getAllOwnerIds,
  getChannelIndex,
  getDmIndex,
  getUserByToken,
} from './functionHelper';

export function messageSendV1(
  token: string,
  channelId: number,
  message: string
) {
  const data = getData();
  const user = getUserByToken(token);
  const channel = findChannel(channelId);
  const allMemberIds = getAllMemberIds(channel);

  // Error Checking
  if (user === undefined) {
    return { error: 'Token is invalid' };
  }
  if (channel === undefined) {
    return { error: 'Channel Not Found' };
  }
  if (allMemberIds.includes(user.authUserId) === false) {
    return { error: 'User is not registered in channel' };
  }
  if (message.length < 1) {
    return { error: 'Message is too short' };
  }
  if (message.length > 1000) {
    return { error: 'Message is too long' };
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

export function messageRemoveV1(token: string, messageId: number) {
  const data = getData();
  const user = getUserByToken(token);
  const channel = findChannelByMessageId(messageId);
  const dm = findDMbyMessageId(messageId);
  let messageIndex = -1;
  let flags;

  if (user === undefined) {
    return { error: 'Token is invalid' };
  }

  if (channel === undefined && dm === undefined) {
    return { error: 'Channel Not Found' };
  } else if (channel !== undefined) {
    messageIndex = findMessageIndexInChannel(channel, messageId);
    flags = channel;
  } else if (dm !== undefined) {
    messageIndex = findMessageIndexInDM(dm, messageId);
    flags = dm;
  }

  const allMemberIds = getAllMemberIds(flags);
  const allOwnerIds = getAllOwnerIds(flags);

  if (allMemberIds.includes(user.authUserId) === false) {
    return { error: 'User is not registered in channel' };
  }

  if (messageIndex === -1) {
    return { error: 'Message Not Found' };
  }

  if (flags === channel) {
    const channelIndex = getChannelIndex(channel.channelId);
    const messageToEdit = data.channels[channelIndex].messages[messageIndex];

    if (
      messageToEdit.uId !== user.authUserId &&
      allOwnerIds.includes(user.authUserId) === false &&
      user.isGlobalOwner === 2
    ) {
      return {
        error: 'User is not the author of the message and not an owner',
      };
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
      return {
        error: 'User is not the author of the message and not an owner',
      };
    }

    data.dm[dmIndex].messages.splice(messageIndex, 1);
    setData(data);
    return {};
  }
}

export function messageEditV1(
  token: string,
  messageId: number,
  message: string
) {
  const data = getData();
  const user = getUserByToken(token);
  const channel = findChannelByMessageId(messageId);
  const allOwnerIds = getAllOwnerIds(channel);
  const allMemberIds = getAllMemberIds(channel);

  // Error checking
  if (user === undefined) {
    return { error: 'Token is invalid' };
  }
  const isGlobalOwner = user.isGlobalOwner;
  if (channel === undefined) {
    return { error: 'Channel Not Found' };
  }
  if (allMemberIds.includes(user.authUserId) === false) {
    return { error: 'User is not registered in channel' };
  }
  const channelIndex = getChannelIndex(channel.channelId);
  const messageIndex = findMessageIndexInChannel(channel, messageId);

  if (messageIndex === -1) {
    return { error: 'Message Not Found' };
  }

  const messageToEdit = data.channels[channelIndex].messages[messageIndex];

  if (
    messageToEdit.uId !== user.authUserId &&
    allOwnerIds.includes(user.authUserId) === false &&
    isGlobalOwner === 2
  ) {
    return { error: 'User is not the author of the message and not an owner' };
  }

  // if messagelength is below 1 delete message
  if (message.length < 1) {
    data.channels[channelIndex].messages.splice(messageIndex, 1);
    setData(data);
    return {};
  }

  // if messagelength is above 1000 return error
  if (message.length > 1000) {
    return { error: 'Message is too long' };
  }

  data.channels[channelIndex].messages[messageIndex].message = message;
  setData(data);
  return {};
}
