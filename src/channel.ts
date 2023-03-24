import { getData, setData } from './dataStore.js';
import { isChannel, isUser, findChannel, findUser } from './channelHelper';
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
  authUserId: number,
  channelId: number,
  start: number
): messages | errorMessage {
  // Get the particular user index in data store
  const user = findUser(authUserId);

  // Get the particular channel index from data store
  const channel = findChannel(channelId);
  // Get the amount of messages in the particular channel

  // Get all uIds in the channel
  const allMemberIds = channel
    ? channel.allMembers.map((member) => member.uId)
    : null;
  // Error if the user is not registered
  if (user === undefined) {
    return { error: 'User Not Found' };
  }
  // Error if the channel is not found
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
    const messagesLeft = channelMessage - start;
    return {
      messages: channel.messages.slice(start, messagesLeft),
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

export function channelJoinV1(authUserId, channelId) {
  // Function for finding authUserId in data store
  function findAuthUser(users) {
    return users.authUserId === authUserId;
  }
  // Function for finding channelId in data store
  function findChannel(channels) {
    return channels.channelId === channelId;
  }
  const data = getData();

  // Get the particular user index in data store
  const user = data.users.find(findAuthUser);

  // Get the particular channel index from data store
  const channel = data.channels.find(findChannel);

  // Get all uIds in the channel
  const allMemberIds = channel
    ? channel.allMembers.map((member) => member.uId)
    : null;
  // Error if the user is not registered
  if (data.users.find(findAuthUser) === undefined) {
    return { error: 'User Not Found' };
  }
  // Error if the channel is not found
  if (data.channels.find(findChannel) === undefined) {
    return { error: 'Channel Not Found' };
  }

  const uId = user.authUserId;

  // Error if the user is already in the channel
  if (allMemberIds.includes(uId) === true) {
    return { error: 'User is already in channel' };
  }

  const isPublic = channel.isPublic;
  const globalPerm = user.isGlobalOwner;
  // Error if the channels is private and not global owner
  if (isPublic === false && globalPerm === 2) {
    if (isPublic === false) {
      return { error: 'Channel is not public' };
    } else {
      return { error: 'User is not global owner' };
    }
  }
  const channelNum = data.channels.findIndex(
    (channel) => channel.channelId === channelId
  );
  // Add the user to the channel
  data.channels[channelNum].allMembers.push({
    uId: authUserId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  });
  setData(data);

  return {};
}

export function channelInviteV1(authUserId, channelId, uId) {
  const data = getData();

  // Function for finding channelId in data store
  function findChannel(channels) {
    return channels.channelId === channelId;
  }
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
  const channel = data.channels.find(findChannel);

  // Get all uIds in the channel
  const allMemberIds = channel
    ? channel.allMembers.map((member) => member.uId)
    : null;

  if (allMemberIds.includes(uId) === true) {
    return { error: 'User already in the channel' };
  }

  if (isChannel(channelId) && allMemberIds.includes(authUserId) === false) {
    return { error: 'You are not a channel member' };
  }
  // Finds the user based on uId
  const user = findUser(uId);
  const channelNum = data.channels.findIndex(
    (channel) => channel.channelId === channelId
  );
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
export function channelDetailsV1(authUserId: number, channelId: number) {
  // If channelId doesn't refer to a valid channel,
  // returns error
  if (!isChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  } else if (!isUser(authUserId)) {
    // If authUserId is invalid, returns error
    return { error: 'Invalid authUserId' };
  }
  const channelObj = findChannel(channelId);
  // If the user is not a member of the channel
  if (!channelObj.allMembers.some((a) => a.uId === authUserId)) {
    return { error: authUserId + ' is not a member of the channel' };
  }
  return {
    name: channelObj.name,
    isPublic: channelObj.isPublic,
    ownerMembers: channelObj.ownerMembers,
    allMembers: channelObj.allMembers,
  };
}
