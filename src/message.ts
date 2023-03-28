import { findChannel, getAllMemberIds, getUserByToken } from './functionHelper';
import { getData, setData } from './dataStore';

export function messageSendV1(
  token: string,
  channelId: number,
  message: string
) {
  const data = getData();
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
  setData(data);
  return { messageId: messageId };
}
