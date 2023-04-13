import { getData, setData } from './dataStore';
import { userObject, errorMessage, allUsers } from './interfaces';
import {
  isUser,
  getUserByToken,
  findUserIndex,
  downloadImage,
} from './functionHelper';
import validator from 'validator';
import HttpError from 'http-errors';
import { port } from './config.json';
import request from 'sync-request';
import sharp from 'sharp';

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
      profileImgUrl: data.users[userNum].profileImgUrl,
    },
  };
}

/**
 * Get user profile based on the given token and user ID.
 *
 * @param {string} token - The user's access token.
 * @param {number} uId - The user ID to retrieve the profile for.
 * @return {Object | errorMessage} Returns a user object if successful, or an error message if unsuccessful.
 */
export function userProfileV2(
  token: string,
  uId: number
): { user: userObject } | errorMessage {
  const user = getUserByToken(token);
  if (user === undefined) {
    return { error: 'Invalid token' };
  }

  const getUser = userProfileV1(user.authUserId, uId);
  return getUser;
}

/**
 * Set the email address of the authenticated user.
 *
 * @param {string} token - The user's access token.
 * @param {string} email - The new email address to set for the user.
 * @return {{} | errorMessage} Returns an empty object if successful, or an error message if unsuccessful.
 */
export function setEmail(token: string, email: string) {
  const user = getUserByToken(token);
  if (user === undefined) {
    return { error: 'Invalid token' };
  }

  if (!validator.isEmail(email)) {
    return { error: 'invalid email' };
  }

  const data = getData();
  if (data.users.some((user) => user.email === email)) {
    return { error: 'email address is already being used by another user' };
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
 * @return {{} | errorMessage} Returns an empty object if successful, or an error message if unsuccessful.
 */
export function setName(token: string, nameFirst: string, nameLast: string) {
  const data = getData();
  const user = getUserByToken(token);
  if (user === undefined) {
    return { error: 'Invalid token' };
  }

  if (
    nameFirst.length < 1 ||
    nameFirst.length > 50 ||
    nameLast.length < 1 ||
    nameLast.length > 50
  ) {
    return { error: 'name length should in range of 1 to 50' };
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
 * @return {{} | errorMessage} Returns an empty object if successful, or an error message if unsuccessful.
 */
export function setHandle(token: string, handleStr: string) {
  const data = getData();
  const user = getUserByToken(token);
  if (user === undefined) {
    return { error: 'Invalid token' };
  }

  if (handleStr.length > 3 && handleStr.length < 20) {
    const userIndex = findUserIndex(user.authUserId);
    data.users[userIndex].handleStr = handleStr;
    setData(data);
    return {};
  }

  return { error: 'handle length should in range of 3 to 20' };
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
      profileImgUrl: a.profileImgUrl,
    })),
  };
}

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
    throw HttpError(403, 'Invalid token');
  }

  const res = request('GET', imgUrl);
  if (res.statusCode !== 200) {
    throw HttpError(400, 'Invalid image URL');
  }

  // check if image is a jpg
  if (!imgUrl.endsWith('.jpg')) {
    throw HttpError(400, 'Invalid image type');
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
    throw HttpError(400, 'Invalid image dimensions');
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

  data.users[
    userIndex
  ].profileImgUrl = `http://${HOST}:${PORT}/img/${randomString}.jpg`;
  setData(data);

  return {};
}
