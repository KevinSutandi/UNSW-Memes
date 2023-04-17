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
  findUserIndex,
} from './functionHelper';
import { messages, errorMessage } from './interfaces';
import HTTPError from 'http-errors';
import { standupActiveV1 } from './standup';

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
    throw HTTPError(403, 'Invalid user token');
  }

  if (channel === undefined) {
    throw HTTPError(400, 'Channel Not Found');
  }
  const channelMessage = channel.messages.length;
  const uId = user.authUserId;
  // Error if the user is not a member of the channel
  if (allMemberIds.includes(uId) === false) {
    throw HTTPError(403, 'User is not a member of the channel');
  }
  // Error if 'start' is greater than the amount of messages
  if (start > channelMessage) {
    throw HTTPError(400, '"Start" is greater than the amount of messages');
  }

  // reverse message
  channel.messages.reverse();

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

export function channelJoinV1(
  token: string,
  channelId: number
): object | errorMessage {
  const data = getData();
  // Get the particular user in data store
  const user = getUserByToken(token);

  // Get the particular channel index from data store
  const channel = findChannel(channelId);

  const allMemberIds = getAllMemberIds(channel);

  if (user === undefined) {
    throw HTTPError(403, 'Invalid user token');
  }

  if (channel === undefined) {
    throw HTTPError(400, 'Channel Not Found');
  }

  const uId = user.authUserId;

  if (allMemberIds.includes(uId) === true) {
    throw HTTPError(400, 'User is already in channel');
  }

  // channel
  if (channel.isPublic === false && user.isGlobalOwner === 2) {
    throw HTTPError(403, 'Channel is not public');
  }
  const channelNum = getChannelIndex(channelId);

  data.channels[channelNum].allMembers.push({
    uId: user.authUserId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
    profileImgUrl: user.profileImgUrl,
  });
  setData(data);

  return {};
}
/**
 *
 * Invites a user to a channel
 * @param {string} token - The authenticated user token
 * @param {number} channelId - The channel Id to join
 * @param {number} uId - The user Id of the invited member
 *
 * @returns {error : 'error message'} - returns an error when
 *                                    | channelId is invalid
 *  *                                 | uId is invalid
 *                                    | User is already in the channel
 *  *                                 | Token refers to a member not in the channel
 *                                    | token is invalid
 */
export function channelInviteV1(token: string, channelId: number, uId: number) {
  const data = getData();

  // Error cases
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!isChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (!isUser(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }
  const channel = findChannel(channelId);

  // Get all uIds in the channel
  const allMemberIds = getAllMemberIds(channel);

  if (allMemberIds.includes(uId) === true) {
    throw HTTPError(400, 'User already in the channel');
  }

  if (
    isChannel(channelId) &&
    allMemberIds.includes(user.authUserId) === false
  ) {
    throw HTTPError(403, 'You are not a channel member');
  }
  // Finds the user based on uId
  const invitedUser = findUser(uId);
  const channelNum = getChannelIndex(channelId);

  // Adds the user to the channel
  data.channels[channelNum].allMembers.push({
    uId: invitedUser.authUserId,
    email: invitedUser.email,
    nameFirst: invitedUser.nameFirst,
    nameLast: invitedUser.nameLast,
    handleStr: invitedUser.handleStr,
    profileImgUrl: invitedUser.profileImgUrl,
  });

  // if user is invited send notification
  const notification = {
    channelId: channelId,
    dmId: -1,
    notificationMessage: `${user.handleStr} added you to ${channel.name}`,
  };

  const userInvitedIndex = findUserIndex(uId);
  data.users[userInvitedIndex].notifications.push(notification);

  setData(data);
  return {};
}

/**
 *
 * Shows the details of the given channel
 * @param {string} token - The authenticated user token
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
  // console.log(token);
  // console.log(channelId);
  const user = getUserByToken(token);
  if (!isChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (user === undefined) {
    // If token is invalid, returns error
    throw HTTPError(403, 'Invalid token');
  }
  // If the user is not a member of the channel
  if (!isChannelMember(channelId, user.authUserId)) {
    throw HTTPError(403, 'User is not a member of the channel');
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
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!isChannelMember(channelId, user.authUserId)) {
    throw HTTPError(403, user.authUserId + ' is not a member of the channel');
  }

  // if standup active and user is standup, throw error
  const channel = findChannel(channelId);
  const standupActive = standupActiveV1(token, channelId).isActive;
  const standupUser = channel.standUp.standUpOwner;
  if (standupActive && standupUser === user.authUserId) {
    throw HTTPError(400, 'Cannot leave channel while standup is active');
  }

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
/**
 *
 * @param {string} token - Token of the user performing the action
 * @param {number} channelId - ID of the channel where the user will be added as owner
 * @param {number} uId - ID of the user to be added as owner
 * @returns {Object | errorMessage} - Empty object if successful, error object otherwise
 */
export function channelAddOwnerV1(
  token: string,
  channelId: number,
  uId: number
): object | errorMessage {
  const data = getData();
  const user = getUserByToken(token);
  const uIdfound = findUser(uId);

  // Error checking
  if (!isChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (uIdfound === undefined) {
    throw HTTPError(400, 'Invalid uId');
  }

  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!isChannelMember(channelId, uId)) {
    throw HTTPError(400, 'User is not a member of the channel');
  }

  if (isChannelOwner(uId, channelId)) {
    throw HTTPError(400, user.authUserId + ' is already owner of this channel');
  }

  if (!isChannelOwner(user.authUserId, channelId) && user.isGlobalOwner === 2) {
    throw HTTPError(403, user.authUserId + ' has no owner permission');
  }

  // owner adds the user with uId to the ownermembers and allmembers of the channel
  const channelfound = data.channels.find((a) => a.channelId === channelId);
  channelfound.ownerMembers.push({
    uId: uIdfound.authUserId,
    email: uIdfound.email,
    nameFirst: uIdfound.nameFirst,
    nameLast: uIdfound.nameLast,
    handleStr: uIdfound.handleStr,
    profileImgUrl: uIdfound.profileImgUrl,
  });
  setData(data);
  return {};
}

/**
 *
 * @param {string} token - The user's authentication token.
 * @param {number} channelId - The ID of the channel.
 * @param {number} uId - The ID of the user to remove as owner.
 * @returns {Object | errorMessage} An empty object if successful, or an object with an "error" property if unsuccessful.
 */
export function channelRemoveOwnerV1(
  token: string,
  channelId: number,
  uId: number
): object | errorMessage {
  const data = getData();
  const user = getUserByToken(token);
  const uIdfound = findUser(uId);
  const channelfound = data.channels.find((a) => a.channelId === channelId);

  if (!isChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  // invalid uId
  if (uIdfound === undefined) {
    throw HTTPError(400, 'Invalid uId');
  }
  // invalid token
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  // // Check if user is in the channel
  // if (!isChannelMember(channelId, uId)) {
  //   throw HTTPError(400, ' is not a member of the channel');
  // }

  // uId user is not owner of the channel
  if (!isChannelOwner(uId, channelId)) {
    throw HTTPError(400, user.authUserId + ' is not owner of this channel');
  }
  // user with token is neither channel owner nor the global owner
  // global owner if 1
  if (!isChannelOwner(user.authUserId, channelId) && user.isGlobalOwner !== 1) {
    throw HTTPError(403, user.authUserId + ' has no owner permission');
  }
  // the owner is the only one in the channel
  if (channelfound.ownerMembers.length === 1) {
    throw HTTPError(400, user.authUserId + ' is the only owner');
  }

  // owner removes the other owner with uId from channel
  const ownerIndex = findOwnerIndex(channelId, uIdfound.authUserId);

  channelfound.ownerMembers.splice(ownerIndex, 1);
  setData(data);
  return {};
}
