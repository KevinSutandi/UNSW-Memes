import { getData, setData } from "./dataStore";

// HELPER FUNCTIONS

/**
 * @typedef {Object} user - object containing user data
 * @property {number} age - users age
 * @property {number} authUserId - authenticated user Id
 * @property {string} authemail - user's email address
 * @property {string} authpw - user's password
 * @property {string} authfirstname - user's first name
 * @property {string} authlastname - user's last name
 * @property {string} handlestring - user's associated handlestring
 * @property {number} isGlobalOwner - determines whether a user is a global owner
 */

/**
  * Determines whether a user is a valid user
  * by checking through users array in the 
  * dataStore.js
  * 
  * @param {number} userId - the authenticated user Id
  * @returns {boolean} - true if the user is in the dataStore
  *                    = false if the user isnt in the dataStore
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
  * @returns {error: 'error message'} - if the authUserId is not in the dataStore and invalid
  *                                   - if the uId is not in the dataStore and invalid
  * @returns {{user}} - returns the user object and its associated data if it exists in the dataStore
  * 
*/
export function userProfileV1(authUserId, uId) {
  // Gets user from the dataStore
  const data = getData();
  // Check that authUserId is valid
  if (!isUser(authUserId)) {
    return { error: "Invalid authUserId" };
  }
  // Check that uId is valid
  if (!isUser(uId)) {
    return { error: "Invalid uId" };
  }
  // Storing the user's data in an object to be returned
  const userNum = data.users.findIndex((a) => a.authUserId === uId);
  // If both conditions are met, return the userNum object information
  return {
    authUserId: data.users[userNum].authId,
    authemail: data.users[userNum].authemail,
    authfirstname: data.users[userNum].authfirstname,
    authlastname: data.users[userNum].authlastname,
    handlestring: data.users[userNum].handlestring,
  };
}