import { getData, setData } from './dataStore';
import { userObject, errorMessage, allUsers } from './interfaces';
import { isUser, getUserByToken, findUserIndex } from './functionHelper';
import validator from 'validator';
import HTTPError from 'http-errors';

/**
 * For a valid user, userProfileV1 returns information about the user
 * including their user ID, email address, first name, last name,
 * and handlestring.
 *
 * @param {number} authUserId - the authenticated user Id
 * @param {number} uId - User's unique Id
 *
 * @returns {error: 'error message'} - if the authUserId is not in the dataStore and invalid
 *                                   | if the uId is not in the dataStore and invalid
 * @returns {{authUserId:number, authemail:string,
 * authfirstname:string, authlastname:string, handlestring:string}} - returns
 * the user object and its associated data if it exists in the dataStore
 *
 */
export function userProfileV1(
  authUserId: number,
  uId: number
): { user: userObject } | errorMessage {
  // Gets user from the dataStore
  const data = getData();
  // Check that uId is valid
  if (!isUser(uId)) {
    return { error: 'Invalid uId' };
  }
  // Storing the user's data in an object to be returned
  const userNum = data.users.findIndex((a) => a.authUserId === uId);
  // If both conditions are met, return the userNum object information
  return {
    user: {
      uId: data.users[userNum].authUserId,
      email: data.users[userNum].email,
      nameFirst: data.users[userNum].nameFirst,
      nameLast: data.users[userNum].nameLast,
      handleStr: data.users[userNum].handleStr,
    },
  };
}



/**
 * Get user profile based on the given token and user ID.
 *
 * @param {string} token - The user's access token.
 * @param {number} uId - The user ID to retrieve the profile for.
 * @return {Object} Returns a user object if successful, or an error message if unsuccessful.
 */
export function userProfileV3(
  token: string,
  uId: number
): { user: userObject } {
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token')
  }

  const data = getData();
  // Check that uId is valid
  if (!isUser(uId)) {
    throw HTTPError(400, 'Invalid uId')
  }
  // Storing the user's data in an object to be returned
  const userNum = data.users.findIndex((a) => a.authUserId === uId);
  // If both conditions are met, return the userNum object information
  return {
    user: {
      uId: data.users[userNum].authUserId,
      email: data.users[userNum].email,
      nameFirst: data.users[userNum].nameFirst,
      nameLast: data.users[userNum].nameLast,
      handleStr: data.users[userNum].handleStr,
    },
  };
}

/**
 * Set the email address of the authenticated user.
 *
 * @param {string} token - The user's access token.
 * @param {string} email - The new email address to set for the user.
 * @return {{}} Returns an empty object if successful, or an error message if unsuccessful.
 */
export function setEmailV2(token: string, email: string) {
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token')
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'invalid email')
  }

  const data = getData();
  if (data.users.some((user) => user.email === email)) {
    throw HTTPError(400, 'email address is already being used by another user')
  }
  const userIndex = findUserIndex(user.authUserId);
  data.users[userIndex].email = email;
  setData(data);
  return {};
}

/**
 * Set the first and last name of the authenticated user.
 *
 * @param {string} token - The user's access token.
 * @param {string} nameFirst - The user's new first name.
 * @param {string} nameLast - The user's new last name.
 * @return {{}} Returns an empty object if successful, or an error message if unsuccessful.
 */
export function setNameV2(token: string, nameFirst: string, nameLast: string) {
  const data = getData();
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token')
  }

  if (
    nameFirst.length < 1 ||
    nameFirst.length > 50 ||
    nameLast.length < 1 ||
    nameLast.length > 50
  ) {
    throw HTTPError(400, 'name length should in range of 1 to 50')
  }
  const userIndex = findUserIndex(user.authUserId);
  data.users[userIndex].nameFirst = nameFirst;
  data.users[userIndex].nameLast = nameLast;
  setData(data);
  return {};
}

/**
 * Set the handle (username) of the authenticated user.
 *
 * @param {string} token - The user's access token.
 * @param {string} handleStr - The new handle for the user.
 * @return {{}} Returns an empty object if successful, or an error message if unsuccessful.
 */
export function setHandleV2(token: string, handleStr: string): {} {
  const data = getData();
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token')
  }

  if (handleStr.length < 3 || handleStr.length > 20 || !/^[a-zA-Z0-9]+$/.test(handleStr)) {
    throw HTTPError(400, 'handle is invalid')
  }
  if (data.users.some((user) => user.handleStr === handleStr)) {
    throw HTTPError(400, 'handle is already had')
  }
  const userIndex = findUserIndex(user.authUserId);
  data.users[userIndex].handleStr = handleStr;
  setData(data);
  return {}
}


/**
 * Get all users.
 *
 * @param {string} token - The user's access token.
 * @return {Array<Object> | errorMessage} Returns an array of user objects if successful, or an error message if unsuccessful.
 */
export function getAllUsers(token: string): allUsers | errorMessage {
  const data = getData();
  const user = getUserByToken(token);
  if (user === undefined) {
    return { error: 'Invalid token' };
  }
  return {
    users: data.users.map((a) => ({
      uId: a.authUserId,
      email: a.email,
      nameFirst: a.nameFirst,
      nameLast: a.nameLast,
      handleStr: a.handleStr,
    })),
  };
}
