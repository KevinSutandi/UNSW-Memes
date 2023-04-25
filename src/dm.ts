import HTTPError from 'http-errors';
import { PrismaClient } from '@prisma/client';
import {
  findDm,
  findUser,
  getCurrentTime,
  getUserByToken,
  isDm,
  isDmMember,
  updateDmInfo,
} from './functionHelper';

const prisma = new PrismaClient();

/**
 *
 * @param {string} token - The user's token making the request
 * @param {Array<number>} uIds - Array of user IDs to add to the DM channel.
 * @returns {dmCreateReturn | errorMessage} - Object containing the newly
 *                                            created DM channel ID and name if successful,
 *                                            or an error message if unsuccessful.
 */
export async function dmCreateV1(token: string, uIds: Array<number>) {
  const user = await getUserByToken(token);

  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  // Make sure that owner does not invite owner
  if (uIds.includes(user.authUserId)) {
    throw HTTPError(400, 'Duplicate uId');
  }

  // Use a Set to check for duplicate user IDs
  const userSet = new Set(uIds);
  if (userSet.size !== uIds.length) {
    throw HTTPError(400, 'Duplicate uId');
  }

  const userArray = [user];
  for (const uId of uIds) {
    const userUId = await findUser(uId);
    if (userUId === undefined) {
      throw HTTPError(400, 'Invalid uId');
    }
    userArray.push(userUId);
  }

  // make name with all the user's handleStr that is inside the set
  // and sort it alphabetically
  let dmName = '';
  for (const uId of userArray) {
    dmName += uId.handleStr + ', ';
  }
  dmName = dmName.slice(0, -2);
  dmName = dmName.split(', ').sort().join(', ');

  // create Array for allMembers that is in array
  const allMembers = [];
  for (const uId of userArray) {
    allMembers.push({
      uId: uId.authUserId,
      email: uId.email,
      handleStr: uId.handleStr,
      nameFirst: uId.nameFirst,
      nameLast: uId.nameLast,
      profileImgUrl: uId.profileImgUrl,
    });
  }

  const dmId = Math.floor(Math.random() * 1000000000);
  await prisma.dm.create({
    data: {
      dmId: dmId,
      name: dmName,
      ownerMembers: {
        create: {
          uId: user.authUserId,
          email: user.email,
          handleStr: user.handleStr,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          profileImgUrl: user.profileImgUrl,
        },
      },
      allMembers: {
        create: allMembers,
      },
      messages: {
        create: [],
      },
      start: 0,
      end: 0,
    },
  });

  // send notification to all the users invited to the dm
  // and add the stats

  const notification = {
    channelId: -1,
    dmId: dmId,
    notificationMessage: `${user.handleStr} added you to ${dmName}`,
  };

  for (const uId of uIds) {
    await prisma.notification.create({
      data: {
        usersId: uId,
        ...notification,
      },
    });
  }

  const dmCount = await prisma.dm.count();
  await prisma.stats.update({
    where: {
      id: 1,
    },
    data: {
      dmsExist: {
        create: {
          numDmsExist: dmCount,
          timeStamp: getCurrentTime(),
        },
      },
    },
  });

  for (const uId of userArray) {
    await updateDmInfo(uId.authUserId, 0);
  }

  return { dmId: dmId };
}

/**
 * Given a DM with a valid dmId that an authorised user is a member
 * of, it provides basic information about the DM.
 *
 * @param {string} token - The authenticated token
 * @param {number} dmId - The DM Id to join
 * ...
 *
 * @returns {
 *  name: string,
 *  ownerMembers: string
 *  allMembers: string} - returns details of the DM when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    | dmId does not refer to a valid DM
 *                                    | the authUser is not a part of the DM
 *                                    | user token is invalid
 */
export async function dmMessagesV1(token: string, dmId: number, start: number) {
  const user = await getUserByToken(token);

  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!isDm(dmId)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }
  if (!isDmMember(dmId, user.authUserId)) {
    throw HTTPError(403, 'User is not a member of the DM');
  }

  const dm = await findDm(dmId);

  const dmMessages = dm.messages.length;

  if (start > dmMessages) {
    throw HTTPError(400, '"Start" is greater than the amount of messages');
  }

  for (const message of dm.messages) {
    if (message.reacts.length !== 0) {
      message.reacts[0].isThisUserReacted = message.reacts[0].uIds.includes(
        user.authUserId
      );
    }
  }

  dm.messages.reverse();

  if (start + 50 > dmMessages) {
    return {
      messages: dm.messages.slice(start),
      start: start,
      end: -1,
    };
  } else {
    return {
      messages: dm.messages.slice(start, start + 50),
      start: start,
      end: -1,
    };
  }
}

/**
 * Given a DM with a valid dmId that an authorised user is a member
 * of, it provides basic information about the DM.
 *
 * @param {string} token - The authenticated token
 * @param {number} dmId - The DM Id to join
 * ...
 *
 * @returns {
 *  name: string,
 *  members: array} - returns details of the DM when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    | dmId does not refer to a valid DM
 *                                    | the authUser is not a part of the DM
 *                                    | user token is invalid
 */
export async function dmDetailsV1(token: string, dmId: number) {
  const user = await getUserByToken(token);

  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!isDm(dmId)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }
  if (!isDmMember(dmId, user.authUserId)) {
    throw HTTPError(403, user.authUserId + ' is not a member of the DM');
  }

  const dmReturn = await prisma.dm.findUnique({
    where: {
      dmId: dmId,
    },
    select: {
      name: true,
      allMembers: true,
    },
  });

  return {
    name: dmReturn.name,
    members: dmReturn.allMembers,
  };
}

/**
 * Provides an array of all dms that an authorised
 * user is a member of by accessing the dm information
 * from data.channels. Then it returns information about
 * the dms.
 *
 * @param {number} token - the authenticated user token
 *
 * @returns {error: 'error message'} - if the given token is invalid
 * @returns {{dmId: number, name: string}} - returns the details of the dms
 * when successful
 *
 */
export async function dmListV1(token: string) {
  const user = await getUserByToken(token);
  if (user == null) {
    throw HTTPError(403, 'Invalid token');
  }

  const userDms = {
    dms: await prisma.dm.findMany({
      where: {
        allMembers: { some: { uId: user.authUserId } },
      },
      select: { dmId: true, name: true },
    }),
  };
  return userDms;
}

/**
  Removes a direct message (DM) with the specified DM ID if the user making the request is the original creator.
  @function
  @name dmRemoveV1
  @param {string} token - The token of the authenticated user.
  @param {number} dmId - The ID of the DM to remove.
  @throws {HTTPError} Throws an error if the token is invalid or if the DM ID does not refer to a valid DM.
  @throws {HTTPError} Throws an error if the user making the request is not the original creator of the DM.
  @returns {Object} An empty object to indicate successful removal of the DM.
*/
export async function dmRemoveV1(token: string, dmId: number) {
  const user = await getUserByToken(token);
  const dm = await findDm(dmId);

  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }
  if (dm === null) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }
  if (!dm.ownerMembers.some((item) => item.uId === user.authUserId)) {
    throw HTTPError(403, 'User is not the original creator');
  }

  for (const member of dm.allMembers) {
    await updateDmInfo(member.uId, 1);
  }

  const dmCount = await prisma.dm.count();
  await prisma.stats.update({
    where: {
      id: 1,
    },
    data: {
      dmsExist: {
        create: {
          numDmsExist: dmCount,
          timeStamp: getCurrentTime(),
        },
      },
    },
  });

  return {};
}

/**
 * Given a dmId of a dm and token, it will remove that member from the dm.
 * If the user is the owner, the chat will still exist if this happens.
 * A user leaving does not update the name of the DM.
 *
 * @param {string} token - The authenticated token
 * @param {number} dmId - The dmId to join
 * ...
 *
 * @returns {} - returns {} when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    | dmId does not refer to a valid DM
 *                                    | dmId is valid and the authorised user is not a member of the DM
 *                                    | user token is invalid
 */
export async function dmLeaveV1(token: string, dmId: number) {
  const user = await getUserByToken(token);

  if (user === null) {
    throw HTTPError(403, 'Invaild token');
  }
  if (!isDm(dmId)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }
  if (!isDmMember(dmId, user.authUserId)) {
    throw HTTPError(403, user.authUserId + ' is not a member of the DM');
  }

  const dm = await findDm(dmId);

  const userIsOwner = dm.ownerMembers.some(
    (member) => member.uId === user.authUserId
  );

  if (userIsOwner) {
    await prisma.dm.update({
      where: {
        dmId: dmId,
      },
      data: {
        ownerMembers: {
          disconnect: {
            uId: user.authUserId,
          },
        },
      },
    });
  }

  await prisma.dm.update({
    where: {
      dmId: dmId,
    },
    data: {
      allMembers: {
        disconnect: {
          uId: user.authUserId,
        },
      },
    },
  });

  await updateDmInfo(user.authUserId, 1);

  return {};
}
