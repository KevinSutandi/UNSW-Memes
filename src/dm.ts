import { getData, setData } from './dataStore';
import { findUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
  dmCreateReturn,
  userData,
  userObject,
  dmData,
  dmListReturn,
} from './interfaces';

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
    return {
      error: 'Invalid token',
    };
  }
  // Find the user information using findUser
  // make an array to check for duplicates
  const userArray: Array<userData> = [];

  // Make sure that owner does not invite owner
  if (uIds.includes(user.authUserId)) {
    return {
      error: 'Duplicate uId',
    };
  }

  // add owner to userArray
  userArray.push(user);

  for (const uId of uIds) {
    const userUId = findUser(uId);
    if (userUId === undefined) {
      return {
        error: 'Invalid uId',
      };
    }

    if (userArray.includes(userUId)) {
      return {
        error: 'Duplicate uId',
      };
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
      },
    ],
    allMembers: allMembers,
    messages: [],
    start: 0,
    end: -1,
  });

  setData(data);
  return { dmId: dmId };
}

/**
 * Determines whether a dm is a valid dm
 * by checking through dms array in the
 * dataStore.js
 *
 * @param {number} dmId - The authenticated channel Id
 * @returns {boolean} - true if the dm is in the dataStore,
 *                    | false if the dm isnt in the dataStore
 *
 */
export function isDm(dmId: number): boolean {
  const data = getData();
  return data.dm.some((a) => a.dmId === dmId);
}

/**
 * Determines whether a user is a valid dm member
 * by checking through dms array in the
 * dataStore.js
 *
 * @param {number} dmId - The authenticated dm Id
 * @param {number} userId - The authenticated user Id
 * @returns {boolean} - true if the user is a member of the dm
 *                    | false if the user isn't a member of the dm
 *
 */
export function isDmMember(dmId: number, userId: number): boolean {
  const dm = findDm(dmId);
  const allMemberIds = getAllMemberIds(dm);
  return allMemberIds.includes(userId);
}

/**
 * Finds the dm object based on the given dmId
 *
 * @param {number} dmId - The authenticated dm Id
 * @returns {undefined} - if the function cannot find the dm
 * @returns {channel}  - returns dm object if the dm is found
 *
 */
export function findDm(dmId: number): dmData | undefined {
  const data = getData();
  return data.dm.find((a) => a.dmId === dmId);
}

/**
 * Returns an array of member IDs for the specified dm.
 *
 * @param {object} dm - The dm object to retrieve member IDs from.
 * @returns {(Array.<uId>|null)} - An array of member IDs, or null if the channel does not contain any.
 */
export function getAllMemberIds(dm: dmData) {
  if (dm) {
    return dm.allMembers.map((member) => member.uId);
  } else {
    return null;
  }
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
    return { error: 'Invalid token' };
  }
  if (!isDm(dmId)) {
    return { error: 'dmId does not refer to a valid DM' };
  }
  if (!isDmMember(dmId, user.authUserId)) {
    return { error: 'User is not a member of the DM' };
  }
  const dmIndex = data.dm.findIndex((a) => a.dmId === dmId);
  const dmMessages = data.dm[dmIndex].messages.length;
  if (start > data.dm[dmIndex].messages.length) {
    return {
      error:
        'start is greater than the total number of messages in the channel',
    };
  }

  const dm = findDm(dmId);
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
    return { error: 'Invalid token' };
  }
  if (!isDm(dmId)) {
    return { error: 'dmId does not refer to a valid DM' };
  }
  if (!isDmMember(dmId, user.authUserId)) {
    return { error: user.authUserId + ' is not a member of the DM' };
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
    return { error: 'Invalid token' };
  }

  const authUserIdToFind = user.authUserId;
  const userDms: dmListReturn = { dms: [] };

  data.dm.forEach((dm) => {
    const isUserInDm = dm.allMembers.some(
      (member) => member.uId === authUserIdToFind
    );
    if (isUserInDm === true) {
      userDms.dms.push({
        dmId: dm.dmId,
        name: dm.name,
      });
    }
  });
  return userDms;
}
