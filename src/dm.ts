import { getData, setData } from './dataStore';
import { findUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
  dmCreateReturn,
  userData,
  userObject,
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

export function dmRemoveV1(token: string, dmId: number) {
  const data = getData();
  const user = getUserByToken(token);

  if (user === undefined) {
    return { error: 'Invalid token' };
  }
  const dmIndex = data.dm.findIndex((item) => item.dmId === dmId);
  if (dmIndex === -1) {
    return { error: 'dmId does not refer to a valid DM' };
  }
  if (
    data.dm[dmIndex].ownerMembers.some((item) => item.uId === user.authUserId)
  ) {
    return { error: 'User is not the original creator' };
  }
  data.dm.splice(dmIndex, 1);
  setData(data);
  return {};
}
