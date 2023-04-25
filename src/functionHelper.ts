import { v4 as uuidv4 } from 'uuid';
import request from 'sync-request';
import HTTPError from 'http-errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 *
 * @param string - either password or token
 * @returns - hashed string
 */
export function HashingString(string: string): string {
  const jwt = require('jsonwebtoken');
  const encryptedPassword = jwt.sign(string, process.env.SECRET_KEY);
  return encryptedPassword;
}

/**
 *
 * @returns {string} - returns a random string of 36 characters using uuidv4
 */
export function makeToken() {
  let token = uuidv4();
  token = HashingString(token);
  return token;
}

export function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

// make a function where user passes in imgUrl and stores in /img/ folder
export async function downloadImage(imgUrl?: string, name?: string) {
  try {
    let image = imgUrl;
    if (name === undefined && imgUrl === undefined) {
      image =
        'https://static.wikia.nocookie.net/joke-battles/images/b/b5/The_Screaming_Cat.jpg';
      name = 'default.jpg';
    }

    const path = require('path');
    const fs = require('fs');

    const dir = path.join(__dirname, '../img');

    const filePath = path.join(dir, 'default.jpg');

    if (fs.existsSync(filePath) && name === 'default.jpg') {
      return;
    }

    const res = request('GET', image);
    const img = res.getBody();

    fs.writeFileSync(path.join(dir, name), img, { flag: 'w' });
  } catch (error) /* istanbul ignore next */ {
    console.error(`Error downloading image: ${error}`);
  }
}

export async function getUserByToken(token: string) {
  const user = await prisma.token.findUnique({
    where: {
      token: token,
    },
    include: {
      users: true,
    },
  });

  if (user == null) {
    return null;
  }

  const returnValue = user.users;

  return returnValue;
}

export async function userRemovedAction(uId: number) {
  await prisma.messages.updateMany({
    where: {
      uId,
    },
    data: {
      message: 'Removed user',
    },
  });

  await prisma.users.update({
    where: {
      authUserId: uId,
    },
    data: {
      nameFirst: 'Removed',
      nameLast: 'user',
      email: '',
      handleStr: '',
      isGlobalowner: 2,
      token: {
        set: [{ token: '' }],
      },
    },
  });

  const channels = await prisma.channels.findMany({
    include: {
      allMembers: true,
      ownerMembers: true,
    },
  });

  const dms = await prisma.dm.findMany({
    include: {
      allMembers: true,
      ownerMembers: true,
    },
  });

  for (const channel of channels) {
    channel.allMembers = channel.allMembers.filter(
      (member) => member.uId !== uId
    );
    channel.ownerMembers = channel.ownerMembers.filter(
      (member) => member.uId !== uId
    );

    await prisma.channels.update({
      where: {
        id: channel.id,
      },
      data: {
        allMembers: {
          set: channel.allMembers,
        },
        ownerMembers: {
          set: channel.ownerMembers,
        },
      },
    });
  }

  for (const dm of dms) {
    dm.allMembers = dm.allMembers.filter((member) => member.uId !== uId);
    dm.ownerMembers = dm.ownerMembers.filter((member) => member.uId !== uId);

    await prisma.dm.update({
      where: {
        id: dm.id,
      },
      data: {
        allMembers: {
          set: dm.allMembers,
        },
        ownerMembers: {
          set: dm.ownerMembers,
        },
      },
    });
  }
}

export async function findChannel(channelId: number) {
  const channel = await prisma.channels.findUnique({
    where: {
      channelId: channelId,
    },
    include: {
      messages: {
        include: {
          reacts: true,
        },
      },
      allMembers: true,
      ownerMembers: true,
      standUp: true,
    },
  });

  return channel;
}

export async function getAllMemberIdsChannel(channelId: number) {
  const allMemberIds = await prisma.channels.findUnique({
    where: {
      channelId: channelId,
    },
    include: {
      allMembers: true,
    },
  });

  return allMemberIds.allMembers.map((allMembers) => allMembers.uId);
}

export async function getAllMemberIdsDm(dmId: number) {
  const allMemberIds = await prisma.dm.findUnique({
    where: {
      dmId: dmId,
    },
    include: {
      allMembers: true,
    },
  });

  return allMemberIds.allMembers.map((allMembers) => allMembers.uId);
}

export async function updateChannelInfo(authUserId: number, flag: number) {
  const user = await prisma.users.findUnique({
    where: {
      authUserId: authUserId,
    },
    include: {
      stats: {
        include: {
          channelsJoined: true,
          dmsJoined: true,
          messagesSent: true,
        },
      },
    },
  });

  const userStats = user.stats;

  // get the latest numChannelsJoined in the array and increment it
  // if it is still blank then set it to 1
  let numChannelsJoined = 0;
  if (userStats.channelsJoined.length > 0) {
    numChannelsJoined =
      userStats.channelsJoined[userStats.channelsJoined.length - 1]
        .numChannelsJoined;
  }

  if (flag === 0) {
    numChannelsJoined++;
  } else if (flag === 1 && numChannelsJoined > 0) {
    numChannelsJoined--;
  } else {
    throw HTTPError(400, 'Cannot decrement below 0');
  }

  await prisma.userStats.update({
    where: {
      id: userStats.id,
    },
    data: {
      channelsJoined: {
        create: {
          timeStamp: getCurrentTime(),
          numChannelsJoined: numChannelsJoined,
        },
      },
    },
  });

  updateInvolvement(authUserId);
}

export async function updateDmInfo(authUserId: number, flag: number) {
  const user = await prisma.users.findUnique({
    where: {
      authUserId: authUserId,
    },
    include: {
      stats: {
        include: {
          channelsJoined: true,
          dmsJoined: true,
          messagesSent: true,
        },
      },
    },
  });

  const userStats = user.stats;

  // get the latest numChannelsJoined in the array and increment it
  // if it is still blank then set it to 1
  let numDmsJoined = 0;
  if (userStats.dmsJoined.length > 0) {
    numDmsJoined =
      userStats.dmsJoined[userStats.dmsJoined.length - 1].numDmsJoined;
  }

  if (flag === 0) {
    numDmsJoined++;
  } else if (flag === 1 && numDmsJoined > 0) {
    numDmsJoined--;
  } else {
    throw HTTPError(400, 'Cannot decrement below 0');
  }

  await prisma.userStats.update({
    where: {
      id: userStats.id,
    },
    data: {
      dmsJoined: {
        create: {
          timeStamp: getCurrentTime(),
          numDmsJoined: numDmsJoined,
        },
      },
    },
  });

  updateInvolvement(authUserId);
}

export async function updateInvolvement(authUserId: number) {
  const user = await prisma.users.findUnique({
    where: {
      authUserId: authUserId,
    },
    include: {
      stats: {
        include: {
          channelsJoined: true,
          dmsJoined: true,
          messagesSent: true,
        },
      },
    },
  });

  const workspaceStats = await prisma.stats.findFirst({
    include: {
      channelsExist: true,
      dmsExist: true,
      messagesExist: true,
    },
  });

  const userStats = user.stats;

  const numChannelsJoined = userStats.channelsJoined.length
    ? userStats.channelsJoined.slice(-1)[0].numChannelsJoined
    : 0;

  const numDmsJoined = userStats.dmsJoined.length
    ? userStats.dmsJoined.slice(-1)[0].numDmsJoined
    : 0;

  const numMessagesSent = userStats.messagesSent.length
    ? userStats.messagesSent.slice(-1)[0].numMessagesSent
    : 0;

  const numChannelsExist = workspaceStats.channelsExist.length
    ? workspaceStats.channelsExist.slice(-1)[0].numChannelsExist
    : 0;

  const numDmsExist = workspaceStats.dmsExist.length
    ? workspaceStats.dmsExist.slice(-1)[0].numDmsExist
    : 0;

  const numMessagesExist = workspaceStats.messagesExist.length
    ? workspaceStats.messagesExist.slice(-1)[0].numMessagesExist
    : 0;

  const numerator = numChannelsJoined + numDmsJoined + numMessagesSent;
  const denominator = numChannelsExist + numDmsExist + numMessagesExist;

  const involvementRate =
    denominator === 0 ? 0 : Math.min(numerator / denominator, 1);

  await prisma.userStats.update({
    where: {
      id: user.stats.id,
    },
    data: {
      involvementRate,
    },
  });
}

export async function isChannel(channelId: number): Promise<boolean> {
  const channel = await prisma.channels.findUnique({
    where: {
      channelId: channelId,
    },
  });
  return !!channel;
}

export async function isUser(authUserId: number): Promise<boolean> {
  const user = await prisma.users.findUnique({
    where: {
      authUserId: authUserId,
    },
  });
  return !!user;
}

export async function findUser(userId: number) {
  const user = await prisma.users.findUnique({
    where: {
      authUserId: userId,
    },
  });

  return user;
}

export async function isChannelMember(
  channelId: number,
  userId: number
): Promise<boolean> {
  const allMemberIds = await getAllMemberIdsChannel(channelId);
  return allMemberIds.includes(userId);
}

export async function isChannelOwner(
  userId: number,
  channelId: number
): Promise<boolean> {
  const channelFound = await findChannel(channelId);
  const ownerMembersIds = channelFound.ownerMembers.map((member) => member.uId);
  return ownerMembersIds.includes(userId);
}

export async function isDm(dmId: number): Promise<boolean> {
  const dm = await prisma.dm.findUnique({ where: { dmId } });
  return !!dm;
}

export async function isDmMember(
  dmId: number,
  userId: number
): Promise<boolean> {
  const allMemberIds = await getAllMemberIdsDm(dmId);
  return allMemberIds.includes(userId);
}

export async function findDm(dmId: number) {
  const dm = await prisma.dm.findUnique({
    where: {
      dmId: dmId,
    },
    include: {
      ownerMembers: true,
      allMembers: true,
      messages: {
        include: {
          reacts: true,
        },
      },
    },
  });

  return dm;
}

export async function updateAllData(
  dataPoint: string,
  authUserId: number,
  flags: string
) {
  const channels = await prisma.channels.findMany({
    include: {
      allMembers: true,
      ownerMembers: true,
    },
  });

  const dms = await prisma.dm.findMany({
    include: {
      allMembers: true,
      ownerMembers: true,
    },
  });

  for (const channel of channels) {
    channel.ownerMembers.forEach((ownerMember) => {
      if (ownerMember.uId === authUserId) {
        ownerMember[flags] = dataPoint;
      }
    });
    channel.allMembers.forEach((allMember) => {
      if (allMember.uId === authUserId) {
        allMember[flags] = dataPoint;
      }
    });

    await prisma.channels.update({
      where: {
        id: channel.id,
      },
      data: {
        allMembers: {
          set: channel.allMembers,
        },
        ownerMembers: {
          set: channel.ownerMembers,
        },
      },
    });
  }

  for (const dm of dms) {
    dm.ownerMembers.forEach((ownerMember) => {
      if (ownerMember.uId === authUserId) {
        ownerMember[flags] = dataPoint;
      }
    });
    dm.allMembers.forEach((member) => {
      if (member.uId === authUserId) {
        member[flags] = dataPoint;
      }
    });

    await prisma.dm.update({
      where: {
        id: dm.id,
      },
      data: {
        allMembers: {
          set: dm.allMembers,
        },
        ownerMembers: {
          set: dm.ownerMembers,
        },
      },
    });
  }
}

export async function updateUtilization() {
  let usersOneChannelDm = 0;

  const users = await prisma.users.findMany({
    include: {
      stats: {
        include: {
          channelsJoined: true,
          dmsJoined: true,
        },
      },
    },
  });

  for (const user of users) {
    const numChannelsJoined = user.stats.channelsJoined.length
      ? user.stats.channelsJoined.slice(-1)[0].numChannelsJoined
      : 0;

    const numDmsJoined = user.stats.dmsJoined.length
      ? user.stats.dmsJoined.slice(-1)[0].numDmsJoined
      : 0;

    if (numChannelsJoined > 0 || numDmsJoined > 0) {
      usersOneChannelDm++;
    }
  }

  const numUsers = users.length;

  await prisma.stats.update({
    where: {
      id: 1,
    },
    data: {
      utilizationRate:
        numUsers === 0 ? 0 : Math.min(usersOneChannelDm / numUsers, 1),
    },
  });
}
