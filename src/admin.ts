import { PrismaClient } from '@prisma/client';
import { getUserByToken, userRemovedAction } from './functionHelper';
import HTTPError from 'http-errors';

const prisma = new PrismaClient();

/**
 * User with permissionId == 1 can change the user with uId
 * @param {string} token
 * @param {number} uId - user Id
 * @param {number} permissionId - permissionId
 * @returns { error : string } error - different error strings for different situations
 * @returns {} - returns {} when successful
 */
export async function adminuserPermissionChangeV1(
  token: string,
  uId: number,
  permissionId: number
) {
  const tokenFound = await getUserByToken(token);
  const uIdfound = await prisma.users.findUnique({
    where: {
      authUserId: uId,
    },
  });

  if (tokenFound === null) {
    throw HTTPError(403, 'Invalid user token');
  }

  if (uIdfound === null) {
    throw HTTPError(400, 'Invalid uId');
  }

  // user with the token is not global owner
  if (tokenFound.isGlobalowner !== 1) {
    throw HTTPError(403, tokenFound.authUserId + ' is not authorised');
  }

  const globalOwnernum = await prisma.users.count({
    where: {
      isGlobalowner: 1,
    },
  });

  if (
    globalOwnernum === 1 &&
    permissionId === 2 &&
    uIdfound.isGlobalowner === 1
  ) {
    throw HTTPError(400, 'You are the only global owner!');
  }

  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'Invalid permissionId');
  }
  if (uIdfound.isGlobalowner === permissionId) {
    throw HTTPError(400, 'User already in permission level');
  }

  // set the globalowner property same as the permissionId
  await prisma.users.update({
    where: {
      authUserId: uId,
    },
    data: {
      isGlobalowner: permissionId,
    },
  });

  return {};
}

export async function adminuserRemoveV1(token: string, uId: number) {
  // errors
  const tokenFound = await getUserByToken(token);
  const uIdfound = await prisma.users.findUnique({
    where: { authUserId: uId },
  });

  if (tokenFound == null) {
    throw HTTPError(403, 'Invalid user token');
  }

  if (!uIdfound) {
    throw HTTPError(400, 'Invalid uId');
  }

  // user with the token is not a global owner
  if (tokenFound.isGlobalowner !== 1) {
    throw HTTPError(403, tokenFound.authUserId + 'is not authorised');
  }

  // user with uId is the only global, and Uid ===
  const globalOwnerCount = await prisma.users.count({
    where: { isGlobalowner: 1 },
  });

  if (globalOwnerCount === 1 && uIdfound.isGlobalowner === 1) {
    throw HTTPError(
      400,
      'The person you are trying to remove is the only Global Owner!'
    );
  }

  userRemovedAction(uId);
  return {};
}
