import { getData, setData } from './dataStore';
import {
  findDm,
  findUser,
  findUserIndex,
  getCurrentTime,
  getUserByToken,
  isDm,
  isDmMember,
  updateDmInfo,
  badRequest,
  forbidden,
} from './functionHelper';
import {
  errorMessage,
  dmCreateReturn,
  userData,
  dmListReturn,
  userObject,
} from './interfaces';
import HTTPError from 'http-errors';

/**
 *
 * @param {string} token - The user's token making the request
 * @param {Array<number>} uIds - Array of user IDs to add to the DM channel.
 * @returns {dmCreateReturn | errorMessage} - Object containing the newly
 *                                            created DM channel ID and name if successful,
 *                                            or an error message if unsuccessful.
 */
export function dmCreateV1(
  token: string,
  uIds: Array<number>
): dmCreateReturn | errorMessage {
  const data = getData();
  const user = getUserByToken(token);

  if (user === undefined) {
    throw HTTPError(forbidden, 'Invalid token');
  }

  // Make sure that owner does not invite owner
  if (uIds.includes(user.authUserId)) {
    throw HTTPError(badRequest, 'Duplicate uId');
  }

  // Use a Set to check for duplicate user IDs
  const userSet = new Set(uIds);
  if (userSet.size !== uIds.length) {
    throw HTTPError(badRequest, 'Duplicate uId');
  }

  const userArray: Array<userData> = [user];
  for (const uId of uIds) {
    const userUId = findUser(uId);
    if (userUId === undefined) {
      throw HTTPError(badRequest, 'Invalid uId');
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
  const allMembers: Array<userObject> = [];
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

  // Create new dm
  const dmId = Math.floor(Math.random() * 1000000000);
  data.dm.push({
    dmId: dmId,
    name: dmName,
    ownerMembers: [
      {
        uId: user.authUserId,
        email: user.email,
        handleStr: user.handleStr,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        profileImgUrl: user.profileImgUrl,
      },
    ],
    allMembers: allMembers,
    messages: [],
    start: 0,
    end: -1,
  });

  // send notification to all the users invited to the dm
  // and add the stats
  for (const uId of uIds) {
    const uIdIndex = findUserIndex(uId);
    data.users[uIdIndex].notifications.push({
      channelId: -1,
      dmId: dmId,
      notificationMessage: `${user.handleStr} added you to ${dmName}`,
    });
  }

  // update the dm info
  data.stats.dmsExist.push({
    numDmsExist: data.dm.length,
    timeStamp: getCurrentTime(),
  });
  setData(data);

  for (const uId of userArray) {
    updateDmInfo(uId.authUserId, 0);
  }

  return { dmId: dmId };
}

/**
 *
 * Given a DM with a valid dmId, authorised members are able
 * to send messages to other group members. This function
 * returns the most recent messages up to the 50th message.
 *
 * @param {number} token - The authenticated user token
 * @param {number} dmId - The dmId to join
 * @param {number} start - The amount of messages in the dm
 * ...
 *
 * @returns {
 * messages: string,
 * start: number,
 * end: number} - returns dm chat information
 * @returns {error : 'error message'} - returns an error when
 *                                    | dmId does not refer to a valid DM
 *                                    | start is greater than the total number of messages in the channel
 *                                    | dmId is valid and the authorised user is not a member of the DM
 *                                    | token is invalid
 */
export function dmMessagesV1(token: string, dmId: number, start: number) {
  const data = getData();
  const user = getUserByToken(token);

  if (user === undefined) {
    throw HTTPError(forbidden, 'Invalid token');
  }
  if (!isDm(dmId)) {
    throw HTTPError(badRequest, 'dmId does not refer to a valid DM');
  }
  if (!isDmMember(dmId, user.authUserId)) {
    throw HTTPError(forbidden, 'User is not a member of the DM');
  }
  const dmIndex = data.dm.findIndex((a) => a.dmId === dmId);
  const dmMessages = data.dm[dmIndex].messages.length;
  if (start > data.dm[dmIndex].messages.length) {
    throw HTTPError(
      badRequest,
      'start is greater than the total number of messages in the channel'
    );
  }

  const dm = findDm(dmId);

  for (const message of dm.messages) {
    if (message.reacts.length !== 0) {
      if (message.reacts[0].uIds.includes(user.authUserId)) {
        message.reacts[0].isThisUserReacted = true;
      } else {
        message.reacts[0].isThisUserReacted = false;
      }
    }
  }
  // reverse message
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
      end: start + 50,
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
 *  ownerMembers: string
 *  allMembers: string} - returns details of the DM when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    | dmId does not refer to a valid DM
 *                                    | the authUser is not a part of the DM
 *                                    | user token is invalid
 */
export function dmDetailsV1(token: string, dmId: number) {
  const user = getUserByToken(token);

  if (user === undefined) {
    throw HTTPError(forbidden, 'Invalid token');
  }
  if (!isDm(dmId)) {
    throw HTTPError(badRequest, 'dmId does not refer to a valid DM');
  }
  if (!isDmMember(dmId, user.authUserId)) {
    throw HTTPError(forbidden, user.authUserId + ' is not a member of the DM');
  }

  const dmObject = findDm(dmId);
  return {
    name: dmObject.name,
    members: dmObject.allMembers,
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
 * @returns {{channelId: number, name: string}} - returns the details of the dms
 * when successful
 *
 */
export function dmListV1(token: string): dmListReturn | errorMessage {
  const data = getData();
  const user = getUserByToken(token);

  if (user === undefined) {
    throw HTTPError(forbidden, 'Invalid token');
  }

  const authUserIdToFind = user.authUserId;
  const userDms: dmListReturn = {
    dms: data.dm
      .filter((dm) =>
        dm.allMembers.some((member) => member.uId === authUserIdToFind)
      )
      .map((dm) => ({ dmId: dm.dmId, name: dm.name })),
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
export function dmRemoveV1(token: string, dmId: number) {
  const user = getUserByToken(token);
  const dm = findDm(dmId);

  if (user === undefined) {
    throw HTTPError(forbidden, 'Invalid token');
  }
  if (dm === undefined) {
    throw HTTPError(badRequest, 'dmId does not refer to a valid DM');
  }
  if (!dm.ownerMembers.some((item) => item.uId === user.authUserId)) {
    throw HTTPError(forbidden, 'User is not the original creator');
  }

  for (const member of dm.allMembers) {
    updateDmInfo(member.uId, 1);
  }

  const data = getData();
  const dmIndex = data.dm.findIndex((a) => a.dmId === dmId);
  const messageToRemove = data.dm[dmIndex].messages.length;
  data.dm.splice(dmIndex, 1);
  data.stats.dmsExist.push({
    timeStamp: getCurrentTime(),
    numDmsExist: data.dm.length,
  });

  let numMessagesSent = 0;
  if (data.stats.messagesExist.length > 0) {
    numMessagesSent =
      data.stats.messagesExist[data.stats.messagesExist.length - 1]
        .numMessagesExist;
  }

  numMessagesSent = numMessagesSent - messageToRemove;

  data.stats.messagesExist.push({
    timeStamp: getCurrentTime(),
    numMessagesExist: numMessagesSent,
  });

  setData(data);

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
export function dmLeaveV1(token: string, dmId: number) {
  const data = getData();
  const user = getUserByToken(token);

  if (user === undefined) {
    throw HTTPError(forbidden, 'Invalid token');
  }
  if (!isDm(dmId)) {
    throw HTTPError(badRequest, 'dmId does not refer to a valid DM');
  }
  if (!isDmMember(dmId, user.authUserId)) {
    throw HTTPError(forbidden, user.authUserId + ' is not a member of the DM');
  }

  const dmIndex = data.dm.findIndex((item) => item.dmId === dmId);

  const userOwnerIndex = data.dm[dmIndex].ownerMembers.findIndex(
    (item) => item.uId === user.authUserId
  );

  const userMemberIndex = data.dm[dmIndex].allMembers.findIndex(
    (item) => item.uId === user.authUserId
  );

  if (userOwnerIndex !== -1) {
    data.dm[dmIndex].ownerMembers.splice(userOwnerIndex, 1);
  }

  data.dm[dmIndex].allMembers.splice(userMemberIndex, 1);
  setData(data);

  // update stats to remove the dm
  updateDmInfo(user.authUserId, 1);
  return {};
}
