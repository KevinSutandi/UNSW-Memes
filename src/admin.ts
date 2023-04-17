import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { getUserByToken } from './functionHelper';
import { newData } from './interfaces';

/**
 * User with permissionId == 1 can change the user with uId
 * @param {string} token
 * @param {number} uId - user Id
 * @param {number} permissionId - permissionId
 * @returns { error : string } error - different error strings for different situations
 * @returns {} - returns {} when successful
 */

// the global owner value should be set as what permissionId set
export function adminuserPermissionChangeV1(
  token: string,
  uId: number,
  permissionId: number
) {
  const data = getData();
  const tokenFound = getUserByToken(token);
  const uIdfound = data.users.find((user) => user.authUserId === uId);

  if (tokenFound === undefined) {
    throw HTTPError(403, 'Invalid user token');
  }

  if (uIdfound === undefined) {
    throw HTTPError(400, 'Invalid uId');
  }

  // user with the token is not global owner
  if (tokenFound.isGlobalOwner !== 1) {
    throw HTTPError(403, tokenFound.authUserId + ' is not authorised');
  }

  // user with uId is the only global, and Uid ===
  const globalOwnernum = data.users.reduce((acc, obj) => {
    if (obj.isGlobalOwner === 1) {
      return acc + obj.isGlobalOwner;
    } else {
      return acc;
    }
  }, 0);

  if (
    globalOwnernum === 1 &&
    permissionId === 2 &&
    uIdfound.isGlobalOwner === 1
  ) {
    throw HTTPError(400, 'You are the only global owner!');
  }

  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'Invalid permissionId');
  }
  if (uIdfound.isGlobalOwner === permissionId) {
    throw HTTPError(400, 'User already in permission level');
  }

  // set the globalowner property same as the permissionId
  //
  // const userfound = data.users.find((a) => a.authUserId === uId);
  // uIdfound.isGlobalOwner = permissionId;
  uIdfound.isGlobalOwner = permissionId;
  setData(data);
  return {};
}

/**
 * remove the user with uId from all channels and DMs, also will not be included in user array
 * @param {string} token
 * @param {number} uId - user Id
 * @returns { error : string } error - different error strings for different situations
 * @returns {} - returns {} when successful
 */
export function adminuserRemoveV1(token: string, uId: number) {
  // errors
  let data = getData();
  const tokenFound = getUserByToken(token);
  const uIdfound = data.users.find((user) => user.authUserId === uId);

  if (tokenFound === undefined) {
    throw HTTPError(403, 'Invalid user token');
  }

  if (uIdfound === undefined) {
    throw HTTPError(400, 'Invalid uId');
  }

  // user with the token is not a global owner
  if (tokenFound.isGlobalOwner !== 1) {
    throw HTTPError(403, tokenFound.authUserId + 'is not authorised');
  }

  // user with uId is the only global, and Uid ===
  const globalOwnernum = data.users.reduce((acc, obj) => {
    if (obj.isGlobalOwner === 1) {
      return acc + obj.isGlobalOwner;
    } else {
      return acc;
    }
  }, 0);

  if (globalOwnernum === 1) {
    throw HTTPError(400, 'You are the only global owner!');
  }
  data = editProfile(uId, data);
  data = replaceMessage(uId, data);
  data = hideChannelDm(uId, data);

  setData(data);
  return {};
}

function replaceMessage(uId: number, data: newData) {
  const removedString = 'Removed user';

  data.channels.forEach((channel) => {
    channel.messages.forEach((message) => {
      if (message.uId === uId) {
        message.message = removedString;
      }
    });
  });

  data.dm.forEach((dm) => {
    dm.messages.forEach((message) => {
      if (message.uId === uId) {
        message.message = removedString;
      }
    });
  });
  return data;
}

function editProfile(uId: number, data: newData) {
  const removeUser = data.users.find((user) => user.authUserId === uId);
  removeUser.nameFirst = 'Removed';
  removeUser.nameLast = 'user';
  removeUser.email = '';
  removeUser.handleStr = '';
  return data;
}

function hideChannelDm(uId: number, data: newData) {
  // hide the element in all DM and channels
  // map.filter
  // isremoved boolean, put the boolean to true if this user is going to be removed
  // const data = getData();
  data.channels.forEach((channel) => {
    channel.allMembers = channel.allMembers.filter(
      (member) => member.uId !== uId
    );
    channel.ownerMembers = channel.ownerMembers.filter(
      (member) => member.uId !== uId
    );
  });

  data.dm.forEach((dm) => {
    dm.allMembers = dm.allMembers.filter((member) => member.uId !== uId);
    dm.ownerMembers = dm.ownerMembers.filter((member) => member.uId !== uId);
  });
  return data;
}
