import {
  findChannel,
  getCurrentTime,
  getUserByToken,
  updateChannelInfo,
} from './functionHelper';
import HTTPError from 'http-errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function channelsCreateV1(
  token: string,
  name: string,
  isPublic: boolean
) {
  // Returns error if name's length is less than 1 or more than 20
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'Invalid name length');
  }
  const user = await getUserByToken(token);
  // Returns error if the given token is invalid
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token');
  }
  const newId = Math.floor(Math.random() * 10000);

  await prisma.channels.create({
    data: {
      channelId: newId,
      name: name,
      isPublic: isPublic,
      messages: {
        create: [],
      },
      standUp: {
        create: {
          standUpActive: false,
          standUpLength: 0,
          standUpMessage: [],
          StandUpOwner: -1,
        },
      },
      start: 0,
      end: 0,
    },
  });

  const channel = await findChannel(newId);

  const allMemberArray = await prisma.allMembers.findUnique({
    where: {
      uId: user.authUserId,
    },
  });

  const ownerMemberArray = await prisma.ownerMembers.findUnique({
    where: {
      uId: user.authUserId,
    },
  });

  if (allMemberArray == null) {
    await prisma.allMembers.create({
      data: {
        uId: user.authUserId,
        handleStr: user.handleStr,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        profileImgUrl: user.profileImgUrl,
      },
    });
  } else {
    await prisma.allMembers.update({
      where: {
        id: user.id,
      },
      data: {
        channels: {
          connect: {
            id: channel.id,
          },
        },
      },
    });
  }

  if (ownerMemberArray == null) {
    await prisma.ownerMembers.create({
      data: {
        uId: user.authUserId,
        handleStr: user.handleStr,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        profileImgUrl: user.profileImgUrl,
      },
    });
  } else {
    await prisma.ownerMembers.update({
      where: {
        id: user.id,
      },
      data: {
        channels: {
          connect: {
            id: channel.id,
          },
        },
      },
    });
  }

  const channelCount = await prisma.channels.count();

  await prisma.stats.update({
    where: {
      id: 1,
    },
    data: {
      channelsExist: {
        create: {
          numChannelsExist: channelCount,
          timeStamp: getCurrentTime(),
        },
      },
    },
  });

  updateChannelInfo(user.authUserId, 0);

  return {
    channelId: newId,
  };
}

/**
 * Provides an array of all channels that an authorised
 * user is a member of by accessing the channel information
 * from data.channels. Then it returns the channelId
 * and name.
 *
 * @param {string} token - the authenticated user token
 *
 * @returns {error: 'error message'} - if the given authUserId is invalid
 * @returns {{channelId: number, name: string}} - returns the details of the channel
 * when successful
 *
 */
export async function channelsListV1(token: string) {
  const user = await getUserByToken(token);
  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  const channels = await prisma.channels.findMany({
    where: {
      allMembers: {
        some: {
          uId: user.authUserId,
        },
      },
    },
    select: {
      channelId: true,
      name: true,
    },
  });

  return { channels: channels };
}

export async function channelsListAllV1(token: string) {
  const user = getUserByToken(token);
  if (user === null) {
    throw HTTPError(403, 'Invalid token');
  }

  const channels = await prisma.channels.findMany({
    select: {
      channelId: true,
      name: true,
    },
  });
  return { channels: channels };
}
