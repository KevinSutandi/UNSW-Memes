import { getData, setData } from './dataStore';
import { findUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
  dmCreateReturn,
  userData,
  userObject,
  dmData,
} from './interfaces';

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

  console.log(data.dm);
  // set data
  setData(data);
  return { dmId: dmId };
}

// helper functions

export function isDm(dmId: number): boolean {
  const data = getData();
  return data.dm.some((a) => a.dmId === dmId);
}

export function isDmMember(dmId: number, userId: number): boolean {
  const dm = findDm(dmId);
  console.log(dmId);
  const allMemberIds = getAllMemberIds(dm);
  console.log(allMemberIds);
  return allMemberIds.includes(userId);
}

export function findDm(dmId: number): dmData | undefined {
  const data = getData();
  return data.dm.find((a) => a.dmId === dmId);
}

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
export function dmMessagesV1(
  token: string,
  dmId: number,
  start: number
) {
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

  const dmMessages = dm.messages.length;
  const uId = user.authUserId;

  if (start > dmMessages) {
    return { error: "'start' is greater than the amount of messages" };
  }
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
