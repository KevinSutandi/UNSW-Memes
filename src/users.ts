import { getData, setData } from './dataStore';
import {
  userObject,
  errorMessage,
  allUsers,
  userStats,
  statsData,
} from './interfaces';
import {
  isUser,
  getUserByToken,
  findUserIndex,
  downloadImage,
  updateAllData,
  updateInvolvement,
  updateUtilization,
} from './functionHelper';
import validator from 'validator';
import HTTPError from 'http-errors';
import { port } from './config.json';
import request from 'sync-request';
import sharp from 'sharp';
// import { getAllMemberIds } from './functionHelper';

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

/**
 * Get user profile based on the given token and user ID.
 *
 * @param {string} token - The user's access token.
 * @param {number} uId - The user ID to retrieve the profile for.
 * @return {Object} Returns a user object if successful, or an error message if unsuccessful.
 */
export function userProfileV2(
  token: string,
  uId: number
): { user: userObject } {
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  const data = getData();
  // Check that uId is valid
  if (!isUser(uId)) {
    throw HTTPError(400, 'Invalid uId');
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
      profileImgUrl: data.users[userNum].profileImgUrl,
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
export function setEmail(token: string, email: string) {
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'invalid email');
  }

  const data = getData();
  if (data.users.some((user) => user.email === email)) {
    throw HTTPError(400, 'email address is already being used by another user');
  }
  const userIndex = findUserIndex(user.authUserId);
  data.users[userIndex].email = email;

  setData(data);
  updateAllData(email, user.authUserId, 'email');
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
export function setName(token: string, nameFirst: string, nameLast: string) {
  const data = getData();
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  if (
    nameFirst.length < 1 ||
    nameFirst.length > 50 ||
    nameLast.length < 1 ||
    nameLast.length > 50
  ) {
    throw HTTPError(400, 'name length should in range of 1 to 50');
  }
  const userIndex = findUserIndex(user.authUserId);
  data.users[userIndex].nameFirst = nameFirst;
  data.users[userIndex].nameLast = nameLast;
  setData(data);
  updateAllData(nameFirst, user.authUserId, 'nameFirst');
  updateAllData(nameLast, user.authUserId, 'nameLast');
  return {};
}

/**
 * Set the handle (username) of the authenticated user.
 *
 * @param {string} token - The user's access token.
 * @param {string} handleStr - The new handle for the user.
 * @return {{}} Returns an empty object if successful, or an error message if unsuccessful.
 */
export function setHandle(
  token: string,
  handleStr: string
): Record<string, never> {
  const data = getData();
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  if (
    handleStr.length < 3 ||
    handleStr.length > 20 ||
    !/^[a-zA-Z0-9]+$/.test(handleStr)
  ) {
    throw HTTPError(400, 'Please use alphanumeric characters only');
  }
  if (data.users.some((user) => user.handleStr === handleStr)) {
    throw HTTPError(400, 'handle is already being used by another user');
  }
  const userIndex = findUserIndex(user.authUserId);
  data.users[userIndex].handleStr = handleStr;
  setData(data);

  updateAllData(handleStr, user.authUserId, 'handleStr');
  return {};
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
    throw HTTPError(403, 'Invalid token');
  }
  return {
    users: data.users.map((a) => ({
      uId: a.authUserId,
      email: a.email,
      nameFirst: a.nameFirst,
      nameLast: a.nameLast,
      handleStr: a.handleStr,
      profileImgUrl: a.profileImgUrl,
    })),
  };
}

/**
 *
 * @param token - The user's access token.
 * @param imgUrl - The URL of the image to upload. (ONLY JPG)
 * @param xStart - The x starting coordinate from the top left corner of the crop area.
 * @param yStart - The y starting coordinate from the top left corner of the crop area.
 * @param xEnd - The x ending coordinate from the top left corner of the crop area.
 * @param yEnd - The y ending coordinate from the top left corner of the crop area.
 * @returns {} - Returns an empty object if successful, or throw error message if unsuccessful.
 */
export function userProfileUploadPhotoV1(
  token: string,
  imgUrl: string,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number
) {
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  const res = request('GET', imgUrl);
  if (res.statusCode !== 200) {
    throw HTTPError(400, 'Invalid image URL');
  }

  // check if image is a jpg
  if (!imgUrl.endsWith('.jpg')) {
    throw HTTPError(400, 'Invalid image type');
  }

  downloadImage(imgUrl, `${user.authUserId}.jpg`);

  const imagePath = `img/${user.authUserId}.jpg`;

  const sizeOf = require('image-size');
  const dimensions = sizeOf(imagePath);

  if (
    xStart < 0 ||
    yStart < 0 ||
    xEnd > dimensions.width ||
    yEnd > dimensions.height ||
    xStart >= xEnd ||
    yStart >= yEnd
  ) {
    throw HTTPError(400, 'Invalid image dimensions');
  }

  // crop photo
  const randomString = Math.random().toString(36).substring(5);
  const imageCroppedPath = `img/${randomString}.jpg`;
  sharp(imagePath)
    .extract({
      left: xStart,
      top: yStart,
      width: xEnd - xStart,
      height: yEnd - yStart,
    })
    .toFile(imageCroppedPath);

  // delete the uncropped photo
  // fs.unlinkSync(imagePath);

  const userIndex = findUserIndex(user.authUserId);
  const data = getData();
  const PORT: number = parseInt(process.env.PORT || port);
  const HOST: string = process.env.IP || 'localhost';
  const newUrl = `http://${HOST}:${PORT}/img/${randomString}.jpg`;

  data.users[userIndex].profileImgUrl = newUrl;

  setData(data);

  updateAllData(newUrl, user.authUserId, 'profileImgUrl');

  return {};
}

export function userStatsV1(token: string): { userStats: userStats } {
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  updateInvolvement(user.authUserId);

  const data = getData();
  const userIndex = findUserIndex(user.authUserId);
  const userStats = data.users[userIndex].stats;

  return { userStats: userStats };
}

export function usersStatsV1(token: string): {
  workspaceStats: statsData;
} {
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  // update utilization rate
  updateUtilization();

  const data = getData();
  const workspaceStats = data.stats;

  return { workspaceStats: workspaceStats };
}
