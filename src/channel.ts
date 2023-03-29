import { getData, setData } from './dataStore';
import {
  isChannel,
  isUser,
  findChannel,
  findUser,
  getAllMemberIds,
  getChannelIndex,
  isChannelMember,
  getUserByToken,
  findMember,
  isChannelOwner,
} from './functionHelper';
import { messages, errorMessage } from './interfaces';

/**
 *
 * @param {number} authUserId - The authenticated user Id
 * @param {number} channelId - The channel Id to join
 * ...
 *
 * @returns {} - returns {} when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    | channelId is invalid
 *                                    | Member is already in channel
 *                                    | Channel is private and not a global owner
 *                                    | User is invalid
 */
export function channelMessagesV1(
  token: string,
  channelId: number,
  start: number
): messages | errorMessage {
  const user = getUserByToken(token);

  const channel = findChannel(channelId);

  const allMemberIds = getAllMemberIds(channel);

  if (user === undefined) {
    return { error: 'User Not Found' };
  }

  if (channel === undefined) {
    return { error: 'Channel Not Found' };
  }
  const channelMessage = channel.messages.length;
  const uId = user.authUserId;
  // Error if the user is not a member of the channel
  if (allMemberIds.includes(uId) === false) {
    return { error: 'User is not registered in channel' };
  }
  // Error if 'start' is greater than the amount of messages
  if (start > channelMessage) {
    return { error: "'start' is greater than the amount of messages" };
  }

  if (start + 50 > channelMessage) {
    return {
      messages: channel.messages.slice(start),
      start: start,
      end: -1,
    };
  } else {
    return {
      messages: channel.messages.slice(start, start + 50),
      start: start,
      end: start + 50,
    };
  }
}

/**
 * Given a channelId of a channel that the authorised user
 * can join, adds them to the channel.
 *
 * @param {string} token - The authenticated token
 * @param {number} channelId - The channel Id to join
 * ...
 *
 * @returns {} - returns {} when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    | channelId is invalid
 *                                    | Member is already in channel
 *                                    | Channel is private and not a global owner
 *                                    | User token is invalid
 */

export function channelJoinV1(token: string, channelId: number) {
  const data = getData();
  // Get the particular user in data store
  const user = getUserByToken(token);

  // Get the particular channel index from data store
  const channel = findChannel(channelId);

  const allMemberIds = getAllMemberIds(channel);

  if (user === undefined) {
    return { error: 'Invalid user token' };
  }

  if (channel === undefined) {
    return { error: 'Channel Not Found' };
  }

  const uId = user.authUserId;

  if (allMemberIds.includes(uId) === true) {
    return { error: 'User is already in channel' };
  }
  if (channel.isPublic === false && user.isGlobalOwner === 2) {
    if (channel.isPublic === false) {
      return { error: 'Channel is not public' };
    } else {
      return { error: 'User is not global owner' };
    }
  }
  const channelNum = getChannelIndex(channelId);

  data.channels[channelNum].allMembers.push({
    uId: user.authUserId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  });
  setData(data);

  return {};
}

export function channelInviteV1(
  authUserId: number,
  channelId: number,
  uId: number
) {
  const data = getData();

  // Error cases
  if (!isUser(authUserId)) {
    return { error: 'Invalid authUserId' };
  }
  if (!isChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }
  if (!isUser(uId)) {
    return { error: 'uId does not refer to a valid user' };
  }
  const channel = findChannel(channelId);

  // Get all uIds in the channel
  const allMemberIds = getAllMemberIds(channel);

  if (allMemberIds.includes(uId) === true) {
    return { error: 'User already in the channel' };
  }

  if (isChannel(channelId) && allMemberIds.includes(authUserId) === false) {
    return { error: 'You are not a channel member' };
  }
  // Finds the user based on uId
  const user = findUser(uId);
  const channelNum = getChannelIndex(channelId);

  // Adds the user to the channel
  data.channels[channelNum].allMembers.push({
    uId: user.authUserId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  });

  setData(data);
}

/**
 *
 *
 * @param {number} authUserId - The authenticated user Id
 * @param {number} channelId - The channel Id to join
 *
 * @returns {
 *  name: string,
 *  isPublic: boolean,
 *  ownerMembers: string,
 *  allMembers: string} - returns the details of the channel when successful
 *
 * @returns {error : 'error message'} - returns an error when
 *                                    | channelId is invalid
 *                                    | User is not a member of the channel
 *                                    | User is invalid
 */
export function channelDetailsV1(token: string, channelId: number) {
  // If channelId doesn't refer to a valid channel,
  // returns error
  const user = getUserByToken(token);
  if (!isChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  } else if (user === undefined) {
    // If token is invalid, returns error
    return { error: 'Invalid token' };
  }
  // If the user is not a member of the channel
  if (!isChannelMember(channelId, user.authUserId)) {
    return { error: user.authUserId + ' is not a member of the channel' };
  }
  const channelObj = findChannel(channelId);
  return {
    name: channelObj.name,
    isPublic: channelObj.isPublic,
    ownerMembers: channelObj.ownerMembers,
    allMembers: channelObj.allMembers,
  };
}

/**
 * Given a channelId of a channel and token, removing the membership of that member,
 * but remain the information of the authorised user
 *
 * @param {string} token - The authenticated token
 * @param {number} channelId - The channel Id to join
 * ...
 *
 * @returns {} - returns {} when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    | channelId is invalid
 *                                    | user is not the channel member
 *                                    | User token is invalid
 */
export function channelLeaveV1(token: string, channelId: number) {
  const data = getData();
  const user = getUserByToken(token);
  if (!isChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }
  if (user === undefined) {
    return { error: 'Invalid token' };
  }
  // If the user is not a member of the channel
  if (!isChannelMember(channelId, user.authUserId)) {
    return { error: user.authUserId + ' is not a member of the channel' };
  }

  const channelIndex = data.channels.findIndex(
    (item) => item.channelId === channelId
  );
  const userOwnerIndex = data.channels[channelsIndex].ownerMembers.findIndex(
    (item) => item.uId === authUserId
  );
  const userMemberIndex = data.channels[channelsIndex].allMembers.findIndex(
    (item) => item.uId === authUserId
  );
  if (userOwnerIndex !== undefined) {
    data.channels(channelIndex).ownerMembers.splice(userOwnerIndex, 1)
  }
  data.channels(channelIndex).allMembers.splice(userMemeberIndex, 1)
  setData(data);
  return {};
}
