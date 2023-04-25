import {
  isUser,
  getUserByToken,
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
import { PrismaClient } from '@prisma/client';
import { statsData, userStats } from './interfaces';

const prisma = new PrismaClient();

/**
 * Get user profile based on the given token and user ID.
 *
 * @param {string} token - The user's access token.
 * @param {number} uId - The user ID to retrieve the profile for.
 * @return {Object} Returns a user object if successful, or an error message if unsuccessful.
 */
export async function userProfileV2(token: string, uId: number) {
  const user = await getUserByToken(token);
  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!isUser(uId)) {
    throw HTTPError(400, 'Invalid uId');
  }

  const userData = await prisma.users.findUnique({
    where: {
      authUserId: uId,
    },
    select: {
      authUserId: true,
      email: true,
      nameFirst: true,
      nameLast: true,
      handleStr: true,
      profileImgUrl: true,
    },
  });

  return {
    user: {
      uId: userData.authUserId,
      email: userData.email,
      nameFirst: userData.nameFirst,
      nameLast: userData.nameLast,
      handleStr: userData.handleStr,
      profileImgUrl: userData.profileImgUrl,
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
export async function setEmail(token: string, email: string) {
  const user = await getUserByToken(token);
  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'invalid email');
  }

  const checkEmail = await prisma.users.findUnique({
    where: {
      email: email,
    },
  });

  if (checkEmail !== null) {
    throw HTTPError(400, 'email address is already being used by another user');
  }

  await prisma.users.update({
    where: {
      authUserId: user.authUserId,
    },
    data: {
      email: email,
    },
  });

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
export async function setName(
  token: string,
  nameFirst: string,
  nameLast: string
) {
  const user = await getUserByToken(token);
  if (user === null) {
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

  await prisma.users.update({
    where: {
      authUserId: user.authUserId,
    },
    data: {
      nameFirst: nameFirst,
      nameLast: nameLast,
    },
  });
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
export async function setHandle(token: string, handleStr: string) {
  const user = await getUserByToken(token);
  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  if (
    handleStr.length < 3 ||
    handleStr.length > 20 ||
    !/^[a-zA-Z0-9]+$/.test(handleStr)
  ) {
    throw HTTPError(400, 'Please use alphanumeric characters only');
  }

  const checkHandle = await prisma.users.findUnique({
    where: {
      handleStr: handleStr,
    },
  });

  if (checkHandle !== null) {
    throw HTTPError(400, 'email address is already being used by another user');
  }

  await prisma.users.update({
    where: {
      authUserId: user.authUserId,
    },
    data: {
      handleStr: handleStr,
    },
  });

  updateAllData(handleStr, user.authUserId, 'handleStr');
  return {};
}

export async function getAllUsers(token: string) {
  const user = getUserByToken(token);
  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  const users = await prisma.users.findMany({
    select: {
      authUserId: true,
      email: true,
      nameFirst: true,
      nameLast: true,
      handleStr: true,
      profileImgUrl: true,
    },
  });
  return {
    users: users.map((a) => ({
      uId: a.authUserId,
      email: a.email,
      nameFirst: a.nameFirst,
      nameLast: a.nameLast,
      handleStr: a.handleStr,
      profileImgUrl: a.profileImgUrl,
    })),
  };
}

export async function userProfileUploadPhotoV1(
  token: string,
  imgUrl: string,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number
) {
  const user = await getUserByToken(token);
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

  await downloadImage(imgUrl, `${user.authUserId}.jpg`);

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

  const PORT: number = parseInt(process.env.PORT || port);
  const HOST: string = process.env.IP || 'localhost';
  const newUrl = `http://${HOST}:${PORT}/img/${randomString}.jpg`;

  await prisma.users.update({
    where: {
      authUserId: user.authUserId,
    },
    data: {
      profileImgUrl: newUrl,
    },
  });

  updateAllData(newUrl, user.authUserId, 'profileImgUrl');

  return {};
}

export async function userStatsV1(
  token: string
): Promise<{ userStats: userStats }> {
  const user = await getUserByToken(token);
  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  updateInvolvement(user.authUserId);

  const userIndex = await prisma.users.findUnique({
    where: {
      authUserId: user.authUserId,
    },
    select: {
      stats: {
        include: {
          channelsJoined: true,
          dmsJoined: true,
          messagesSent: true,
        },
      },
    },
  });

  return { userStats: userIndex.stats };
}

export async function usersStatsV1(token: string): Promise<{
  workspaceStats: statsData;
}> {
  const user = await getUserByToken(token);
  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  // update utilization rate
  updateUtilization();

  const workspaceStats = await prisma.stats.findFirst({
    include: {
      channelsExist: true,
      dmsExist: true,
      messagesExist: true,
    },
  });

  return { workspaceStats: workspaceStats };
}
