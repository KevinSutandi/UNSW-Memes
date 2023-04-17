import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { getUserByToken } from './functionHelper';

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
 * User with permissionId == 1 can change the user with uId
 * @param {string} token
 * @param {number} uId - user Id
 * @param {number} permissionId - permissionId
 * @returns { error : string } error - different error strings for different situations
 * @returns {} - returns {} when successful
 */
export function adminuserRemoveV1(token: string, uId: number) {
  return {};
}
