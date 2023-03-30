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
  isChannelOwner,
  findOwnerIndex,
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
  // console.log(JSON.stringify(getData(), null, 4));
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
  /*
  const memberId = user.authUserId;
  const channelFound = findChannel(channelId);
  const removing = findMember(memberId, channelId);
  delete removing.uId;

  // if user is the owner
  if (isChannelOwner(memberId, channelId)) {
    console.log(channelFound);
    delete channelFound.ownerMembers.authUserId;
  }
  */
  const channelIndex = data.channels.findIndex(
    (item) => item.channelId === channelId
  );
  const userOwnerIndex = data.channels[channelIndex].ownerMembers.findIndex(
    (item) => item.uId === user.authUserId
  );
  const userMemberIndex = data.channels[channelIndex].allMembers.findIndex(
    (item) => item.uId === user.authUserId
  );
  if (userOwnerIndex !== -1) {
    data.channels[channelIndex].ownerMembers.splice(userOwnerIndex, 1);
  }
  data.channels[channelIndex].allMembers.splice(userMemberIndex, 1);

  setData(data);
  return {};
}

export function channelAddOwnerV1(
  token: string,
  channelId: number,
  uId: number
) {
  const data = getData();
  const user = getUserByToken(token);
  const uIdfound = findUser(uId);

  if (!isChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }
  // invalid uId
  if (uIdfound === undefined) {
    return { error: 'Invalid uId' };
  }
  // invalid token
  if (user === undefined) {
    return { error: 'Invalid token' };
  }
  // If the user is not a member of the channel
  if (!isChannelMember(channelId, uId)) {
    return { error: ' is not a member of the channel' };
  }
  // user with that uId is already owner of the channel
  if (isChannelOwner(uId, channelId)) {
    return { error: user.authUserId + ' is already owner of this channel' };
  }
  // user with token is neither channel owner nor the global owner
  // global owner if 1
  if (!isChannelOwner(user.authUserId, channelId) && user.isGlobalOwner === 2) {
    return { error: user.authUserId + 'has no owner permission' };
  }

  // owner adds the user with uId to the ownermembers and allmembers of the channel
  const channelfound = data.channels.find((a) => a.channelId === channelId);
  console.log(channelfound.allMembers);
  channelfound.ownerMembers.push({
    uId: uIdfound.authUserId,
    email: uIdfound.email,
    nameFirst: uIdfound.nameFirst,
    nameLast: uIdfound.nameLast,
    handleStr: uIdfound.handleStr,
  });
  setData(data);
  return {};
}

export function channelRemoveOwnerV1(
  token: string,
  channelId: number,
  uId: number
) {
  const data = getData();
  const user = getUserByToken(token);
  const uIdfound = findUser(uId);
  const channelfound = data.channels.find((a) => a.channelId === channelId);

  if (!isChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }
  // invalid uId
  if (uIdfound === undefined) {
    return { error: 'Invalid uId' };
  }
  // invalid token
  if (user === undefined) {
    return { error: 'Invalid token' };
  }

  // Check if user is in the channel
  if (!isChannelMember(channelId, uId)) {
    return { error: ' is not a member of the channel' };
  }

  // uId user is not owner of the channel
  if (!isChannelOwner(uId, channelId)) {
    return { error: user.authUserId + ' is not owner of this channel' };
  }
  // user with token is neither channel owner nor the global owner
  // global owner if 1
  if (!isChannelOwner(user.authUserId, channelId) && (user.isGlobalOwner !== 1)) {
    return { error: user.authUserId + ' has no owner permission' };
  }
  // the owner is the only one in the channel
  if (channelfound.ownerMembers.length === 1) {
    return { error: user.authUserId + 'is the only owner' };
  }

  // owner removes the other owner with uId from channel
  const ownerIndex = findOwnerIndex(channelId, uIdfound.authUserId);
  // channelfound.ownerMembers.({
  //   uId: uIdfound.authUserId,
  //   email: uIdfound.email,
  //   nameFirst: uIdfound.nameFirst,
  //   nameLast: uIdfound.nameLast,
  //   handleStr: uIdfound.handleStr,
  // });

  channelfound.ownerMembers.splice(ownerIndex, 1);
  setData(data);
  return {};
}
