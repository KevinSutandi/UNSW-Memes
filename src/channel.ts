import HTTPError from 'http-errors';
import { PrismaClient } from '@prisma/client';
import {
  findChannel,
  findUser,
  getAllMemberIdsChannel,
  getUserByToken,
  isChannel,
  isChannelMember,
  isChannelOwner,
  isUser,
  updateChannelInfo,
} from './functionHelper';

const prisma = new PrismaClient();

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
export async function channelMessagesV1(
  token: string,
  channelId: number,
  start: number
) {
  const user = await getUserByToken(token);

  const channel = await findChannel(channelId);

  const allMemberIds = await getAllMemberIdsChannel(channelId);

  // error cases
  if (user === null) {
    throw HTTPError(403, 'Invalid user token');
  }

  if (channel === null) {
    throw HTTPError(400, 'Channel Not Found');
  }

  const channelMessage = channel.messages.length;
  const uId = user.authUserId;

  if (!allMemberIds.includes(uId)) {
    throw HTTPError(403, 'User is not a member of the channel');
  }

  if (start > channelMessage) {
    throw HTTPError(400, '"Start" is greater than the amount of messages');
  }

  for (const message of channel.messages) {
    if (message.reacts.length !== 0) {
      message.reacts[0].isThisUserReacted = message.reacts[0].uIds.includes(
        user.authUserId
      );
    }
  }

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

export async function channelJoinV1(token: string, channelId: number) {
  const user = await getUserByToken(token);

  if (user == null) {
    throw HTTPError(403, 'Invalid user token');
  }

  const channel = await findChannel(channelId);

  if (channel == null) {
    throw HTTPError(400, 'Channel not found');
  }

  const allMemberIds = await getAllMemberIdsChannel(channelId);

  if (allMemberIds.includes(user.authUserId)) {
    throw HTTPError(400, 'User is already in channel');
  }

  if (!channel.isPublic && user.isGlobalowner !== 2) {
    throw HTTPError(403, 'Channel is not public');
  }

  const allMemberArray = await prisma.allMembers.findUnique({
    where: {
      uId: user.authUserId,
    },
  });

  if (allMemberArray == null) {
    await prisma.allMembers.create({
      data: {
        uId: user.authUserId,
        handleStr: user.handleStr,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        profileImgUrl: user.profileImgUrl,
        channels: {
          connect: {
            id: channel.id,
          },
        },
      },
    });
  }

  // updates user stats
  await updateChannelInfo(user.authUserId, 0);

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

export async function channelInviteV1(
  token: string,
  channelId: number,
  uId: number
) {
  const user = await getUserByToken(token);

  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!isChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (!isUser(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  const channel = await findChannel(channelId);

  const allMemberIds = await getAllMemberIdsChannel(channelId);

  if (allMemberIds.includes(uId)) {
    throw HTTPError(400, 'User already in the channel');
  }

  if (!allMemberIds.includes(user.authUserId)) {
    throw HTTPError(403, 'You are not a channel member');
  }

  // Finds the user based on uId
  const invitedUser = await findUser(uId);

  await prisma.channels.update({
    where: {
      channelId: channel.channelId,
    },
    data: {
      allMembers: {
        create: [
          {
            uId: invitedUser.authUserId,
            email: invitedUser.email,
            nameFirst: invitedUser.nameFirst,
            nameLast: invitedUser.nameLast,
            handleStr: invitedUser.handleStr,
            profileImgUrl: invitedUser.profileImgUrl,
          },
        ],
      },
    },
  });

  // if user is invited send notification
  const notification = {
    channelId: channelId,
    dmId: -1,
    notificationMessage: `${user.handleStr} added you to ${channel.name}`,
  };

  await prisma.notification.create({
    data: {
      usersId: invitedUser.authUserId,
      ...notification,
    },
  });

  // update invited user stats
  await updateChannelInfo(uId, 0);
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
export async function channelDetailsV1(token: string, channelId: number) {
  // If channelId doesn't refer to a valid channel,
  // returns error
  const user = await getUserByToken(token);

  if (!isChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (user === null) {
    // If token is invalid, returns error
    throw HTTPError(403, 'Invalid token');
  }
  // If the user is not a member of the channel
  if (!isChannelMember(channelId, user.authUserId)) {
    throw HTTPError(403, 'User is not a member of the channel');
  }
  const channelObj = await prisma.channels.findUnique({
    where: {
      channelId: channelId,
    },
    include: {
      ownerMembers: true,
      allMembers: true,
    },
  });
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
export async function channelLeaveV1(token: string, channelId: number) {
  const user = await getUserByToken(token);
  if (!isChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!isChannelMember(channelId, user.authUserId)) {
    throw HTTPError(403, user.authUserId + ' is not a member of the channel');
  }

  // if standup active and user is standup, throw error
  // const channel = await findChannel(channelId);
  // const standupActive = standupActiveV1(token, channelId).isActive;
  // const standupUser = channel.standUp.StandUpOwner;
  // if (standupActive && standupUser === user.authUserId) {
  //   throw HTTPError(400, 'Cannot leave channel while standup is active');
  // }

  await prisma.channels.update({
    where: { channelId },
    data: {
      ownerMembers: {
        disconnect: { uId: user.authUserId },
      },
      allMembers: {
        disconnect: { uId: user.authUserId },
      },
    },
  });

  // update user stats
  updateChannelInfo(user.authUserId, 1);
  return {};
}

/**
 *
 * @param {string} token - The user's authentication token.
 * @param {number} channelId - The ID of the channel.
 * @param {number} uId - The ID of the user to remove as owner.
 * @returns {Object | errorMessage} An empty object if successful, or an object with an "error" property if unsuccessful.
 */
export async function channelAddOwnerV1(
  token: string,
  channelId: number,
  uId: number
) {
  const user = await getUserByToken(token);
  const uIdfound = await findUser(uId);

  // Error checking
  if (!isChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (uIdfound === null) {
    throw HTTPError(400, 'Invalid uId');
  }

  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  if (isChannelOwner(uId, channelId)) {
    throw HTTPError(400, user.authUserId + ' is already owner of this channel');
  }

  if (!isChannelOwner(user.authUserId, channelId) && user.isGlobalowner === 2) {
    throw HTTPError(403, user.authUserId + ' has no owner permission');
  }

  // Add user to ownerMembers and allMembers of the channel
  await prisma.channels.update({
    where: {
      channelId: channelId,
    },
    data: {
      ownerMembers: {
        connect: {
          uId: uIdfound.authUserId,
        },
      },
    },
  });

  return {};
}

export async function channelRemoveOwnerV1(
  token: string,
  channelId: number,
  uId: number
) {
  const user = await getUserByToken(token);
  const uIdfound = await findUser(uId);
  const channelfound = await findChannel(channelId);

  // Error checking
  if (!isChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (uIdfound === null) {
    throw HTTPError(400, 'Invalid uId');
  }

  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!isChannelMember(channelId, uId)) {
    throw HTTPError(400, 'User is not a member of the channel');
  }

  if (!isChannelMember(channelId, user.authUserId)) {
    throw HTTPError(403, 'You are not a member of the channel');
  }

  if (!isChannelOwner(uId, channelId)) {
    throw HTTPError(400, uIdfound.authUserId + ' is not owner of this channel');
  }

  if (!isChannelOwner(user.authUserId, channelId) && user.isGlobalowner !== 1) {
    throw HTTPError(403, user.authUserId + ' has no owner permission');
  }

  if (channelfound.ownerMembers.length === 1) {
    throw HTTPError(400, user.authUserId + ' is the only owner');
  }

  await prisma.channels.update({
    where: {
      channelId: channelId,
    },
    data: {
      ownerMembers: {
        disconnect: {
          uId: uIdfound.authUserId,
        },
      },
    },
  });

  return {};
}
