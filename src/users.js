import { getData, setData } from './dataStore.js';

// HELPER FUNCTIONS

/**
 * @typedef {Object} user - object containing user information to be retuned
 * @property {number} uId - user's unique id
 * @property {string} handleStr - user's handlestring
 * @property {string} email - user's email
 * @property {string} nameFirst - user's first name
 * @property {string} nameLast - user's last name
 */

/**
 * Determines whether a user is a valid user
 * by checking through users array in the
 * dataStore.js
 *
 * @param {number} userId - the authenticated user Id
 * @returns {boolean} - true if the user is in the dataStore
 *                    | false if the user isnt in the dataStore
 */
export function isUser(userId) {
  const data = getData();
  return data.users.some((a) => a.authUserId === userId);
}

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
export function userProfileV1(authUserId, uId) {
  // Gets user from the dataStore
  const data = getData();
  // Check that authUserId is valid
  if (!isUser(authUserId)) {
    return { error: 'Invalid authUserId' };
  }
  // Check that uId is valid
  if (!isUser(uId)) {
    return { error: 'Invalid uId' };
  }
  // Storing the user's data in an object to be returned
  const userNum = data.users.findIndex((a) => a.authUserId === uId);
  // If both conditions are met, return the userNum object information
  return {
    uId: data.users[userNum].authUserId,
    email: data.users[userNum].email,
    nameFirst: data.users[userNum].nameFirst,
    nameLast: data.users[userNum].nameLast,
    handleStr: data.users[userNum].handleStr,
  };
}
