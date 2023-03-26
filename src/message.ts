import {
  findChannel,
  findChannelByMessageId,
  getAllMemberIds,
  getAllOwnerIds,
  getUserByToken,
} from './functionHelper';

export function messageSendV1(
  token: string,
  channelId: number,
  message: string
) {
  const user = getUserByToken(token);
  const channel = findChannel(channelId);
  const allMemberIds = getAllMemberIds(channel);
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
  const messageId = Math.floor(Math.random() * 1000000);
  const newMessage = {
    messageId: messageId,
    uId: user.authUserId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
  };
  channel.messages.push(newMessage);
  return { messageId: messageId };
}

export function messageRemoveV1(token: string, messageId: number) {
  const user = getUserByToken(token);
  const channel = findChannelByMessageId(messageId);
  const allOwnerIds = getAllOwnerIds(channel);
  const allMemberIds = getAllMemberIds(channel);
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
  const message = channel.messages.find(
    (message) => message.messageId === messageId
  );
  if (message === undefined) {
    return { error: 'Message Not Found' };
  }
  if (
    message.uId !== user.authUserId &&
    allOwnerIds.includes(user.authUserId) === false &&
    isGlobalOwner === 2
  ) {
    return { error: 'User is not the author of the message' };
  }
  channel.messages = channel.messages.filter(
    (message) => message.messageId !== messageId
  );
  return {};
}
