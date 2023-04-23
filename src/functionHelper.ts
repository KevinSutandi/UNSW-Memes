import { getData, setData } from './dataStore';
import request from 'sync-request';
import { channelData, dmData, userData } from './interfaces';
import { v4 as uuidv4 } from 'uuid';
import HTTPError from 'http-errors';
import dotenv from 'dotenv';
// import { data } from './dataStore';

dotenv.config();

/**
 * Determines whether a channel is a valid channel
 * by checking through channels array in the
 * dataStore.js
 *
 * @param {number} channelId - The authenticated channel Id
 * @returns {boolean} - true if the channel is in the dataStore,
 *                    | false if the channel isnt in the dataStore
 *
 */
export function isChannel(channelId: number): boolean {
  const data = getData();
  return data.channels.some((a) => a.channelId === channelId);
}

/**
 * Finds the channel object based on the given channelId
 *
 * @param {number} channelId - The authenticated channel Id
 * @returns {undefined} - if the function cannot find the channel
 * @returns {channel}  - returns channel object if the channel is found
 *
 */
export function findChannel(channelId: number): channelData | undefined {
  const data = getData();
  return data.channels.find((a) => a.channelId === channelId);
}

/**
 * Determines whether a user is a valid user
 * by checking through users array in the
 * dataStore.js
 *
 * @param {number} userId - the authenticated userId
 * @returns {boolean} - true if the channel is in dataStore
 *                    = false if it is not
 *
 */
export function isUser(authUserId: number): boolean {
  const data = getData();
  return data.users.some((a) => a.authUserId === authUserId);
}

/**
 * Finds the user object based on the given userId
 *
 * @param {number} userId - the authenticated user Id
 * @returns {undefined} - returns undefined if the user isnt in the dataStore
 * @returns {userData | undefined} - returns user object if the user is in the dataStore
 *
 */
export function findUser(userId: number): userData | undefined {
  const data = getData();
  return data.users.find((a) => a.authUserId === userId);
}

/**
 * Returns an array of member IDs for the specified channel.
 *
 * @param {object} channel - The channel object to retrieve member IDs from.
 * @returns {(Array.<number>|null)} - An array of member IDs, or null if the channel does not contain any.
 */
export function getAllMemberIds(
  dataPoint: channelData | dmData
): Array<number> {
  if (dataPoint) {
    return dataPoint.allMembers.map((member) => member.uId);
  } else {
    return null;
  }
}

/**
 * Returns the index of the channel with the specified ID.
 *
 * @param {number} channelId - The ID of the channel to retrieve the index of.
 * @returns {number} - The index of the channel with the specified ID, or -1 if no matching channel is found.
 */
export function getChannelIndex(channelId: number): number {
  const data = getData();
  return data.channels.findIndex((channel) => channel.channelId === channelId);
}

/**
 * Returns the index of the DM with the specified ID.
 * @param {number} dmId - The ID of the DM to retrieve the index of.
 * @returns {number} - The index of the DM with the specified ID, or -1 if no matching DM is found.
 */
export function getDmIndex(dmId: number): number {
  const data = getData();
  return data.dm.findIndex((dm) => dm.dmId === dmId);
}

/**
 * Checks if a user is a member of a given channel.
 * @param {number} channelId - The ID of the channel to check.
 * @param {number} userId - The ID of the user to check.
 * @returns {boolean} - Returns true if the user is a member of the channel, and false otherwise.
 */
export function isChannelMember(channelId: number, userId: number): boolean {
  const channel = findChannel(channelId);
  const allMemberIds = getAllMemberIds(channel);
  return allMemberIds.includes(userId);
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

/**
 * Returns the user object that corresponds to the provided token.
 * @param {string} token - The token to search for.
 * @returns {userData|undefined} - The user object if found, or undefined if not.
 */
export function getUserByToken(token: string) {
  const data = getData();
  const tokenFound = data.users.find((c) =>
    c.token.find((t) => t.token === token)
  );
  return tokenFound;
}

export function getUserIndexByToken(token: string): number {
  const data = getData();
  const tokenFound = data.users.findIndex((c) =>
    c.token.find((t) => t.token === token)
  );
  return tokenFound;
}
/**
 * Returns the channel that contains the message with the specified ID.
 * @param {number} messageId - The ID of the message to find.
 * @returns {channelData|undefined} - The channel object that contains the message with the specified ID,
 *                                    or undefined if no channel contains the message.
 */
export function findChannelByMessageId(
  messageId: number
): channelData | undefined {
  const data = getData();
  const channelFound = data.channels.find((channel) =>
    channel.messages.find((messages) => messages.messageId === messageId)
  );
  return channelFound;
}

export function findDMbyMessageId(messageId: number): dmData | undefined {
  const data = getData();
  const dmFound = data.dm.find((dm) =>
    dm.messages.find((messages) => messages.messageId === messageId)
  );
  return dmFound;
}

export function isChannelOwner(userId: number, channelId: number): boolean {
  const channelFound = findChannel(channelId);
  const ownerMembersIds = channelFound.ownerMembers.map((member) => member.uId);
  return ownerMembersIds.includes(userId);
}

export function getAllOwnerIds(channel: channelData | dmData): Array<number> {
  return channel.ownerMembers.map((owner) => owner.uId);
}

export function findTokenIndex(user: userData, token: string): number {
  return user.token.findIndex((item) => item.token === token);
}

export function findOwnerIndex(channelId: number, uId: number): number {
  const channelFound = findChannel(channelId);
  return channelFound.ownerMembers.findIndex((item) => item.uId === uId);
}

export function findMessageIndexInChannel(
  channel: channelData,
  messageId: number
): number {
  return channel.messages.findIndex((item) => item.messageId === messageId);
}

export function findMessageIndexInDM(dm: dmData, messageId: number): number {
  return dm.messages.findIndex((item) => item.messageId === messageId);
}

export function findDMbyId(dmId: number): dmData | undefined {
  const data = getData();
  return data.dm.find((dm) => dm.dmId === dmId);
}

export function findUserIndex(userId: number): number {
  const data = getData();
  return data.users.findIndex((user) => user.authUserId === userId);
}

export function HashingString(string: string): string {
  const jwt = require('jsonwebtoken');
  const encryptedPassword = jwt.sign(string, process.env.SECRET_KEY);
  return encryptedPassword;
}

export function findUserbyEmail(email: string) {
  const data = getData();
  return data.users.find((user) => user.email === email);
}
// make a function where user passes in imgUrl and stores in /img/ folder
export function downloadImage(imgUrl?: string, name?: string) {
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

export function updateAllData(
  dataPoint: string,
  authUserId: number,
  flags: string
) {
  const data = getData();

  data.channels.forEach((channel) => {
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
  });

  data.dm.forEach((dm) => {
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
  });

  setData(data);
}

/**
 * Determines whether a dm is a valid dm
 * by checking through dms array in the
 * dataStore.js
 *
 * @param {number} dmId - The authenticated channel Id
 * @returns {boolean} - true if the dm is in the dataStore,
 *                    | false if the dm isnt in the dataStore
 *
 */
export function isDm(dmId: number): boolean {
  const data = getData();
  return data.dm.some((a) => a.dmId === dmId);
}

/**
 * Determines whether a user is a valid dm member
 * by checking through dms array in the
 * dataStore.js
 *
 * @param {number} dmId - The authenticated dm Id
 * @param {number} userId - The authenticated user Id
 * @returns {boolean} - true if the user is a member of the dm
 *                    | false if the user isn't a member of the dm
 *
 */
export function isDmMember(dmId: number, userId: number): boolean {
  const dm = findDm(dmId);
  const allMemberIds = getAllMemberIds(dm);
  return allMemberIds.includes(userId);
}

/**
 * Finds the dm object based on the given dmId
 *
 * @param {number} dmId - The authenticated dm Id
 * @returns {undefined} - if the function cannot find the dm
 * @returns {channel}  - returns dm object if the dm is found
 *
 */
export function findDm(dmId: number): dmData | undefined {
  const data = getData();
  return data.dm.find((a) => a.dmId === dmId);
}

export function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 *
 * @param token - token of the user to update
 * @param flag - 0 for increment, 1 for decrement
 */
export function updateChannelInfo(authUserId: number, flag: number) {
  // find the user and increment the number of channels they are in
  const data = getData();
  const timeStamp = getCurrentTime();
  const userIndex = findUserIndex(authUserId);
  const userStats = data.users[userIndex].stats;
  // get the latest numChannelsJoined in the array and increment it
  // if it is still blank then set it to 1
  let numChannelsJoined = 0;
  if (userStats.channelsJoined.length > 0) {
    numChannelsJoined =
      userStats.channelsJoined[userStats.channelsJoined.length - 1]
        .numChannelsJoined;
  }

  /* istanbul ignore else */
  if (flag === 0) {
    numChannelsJoined++;
  } else if (flag === 1 && numChannelsJoined > 0) {
    numChannelsJoined--;
  } else {
    throw HTTPError(400, 'Cannot decrement below 0');
  }

  data.users[userIndex].stats.channelsJoined.push({
    timeStamp: timeStamp,
    numChannelsJoined: numChannelsJoined,
  });

  setData(data);

  updateInvolvement(authUserId);
}

export function updateDmInfo(authUserId: number, flags: number) {
  // find the user and increment the number of channels they are in
  const data = getData();
  const timeStamp = getCurrentTime();
  const userIndex = findUserIndex(authUserId);
  const userStats = data.users[userIndex].stats;
  // get the latest numChannelsJoined in the array and increment it
  // if it is still blank then set it to 1
  let numDmsJoined = 0;
  if (userStats.dmsJoined.length > 0) {
    numDmsJoined =
      userStats.dmsJoined[userStats.dmsJoined.length - 1].numDmsJoined;
  }

  /* istanbul ignore else */
  if (flags === 0) {
    numDmsJoined++;
  } else if (flags === 1 && numDmsJoined > 0) {
    numDmsJoined--;
  } else {
    throw HTTPError(400, 'Cannot decrement below 0');
  }

  data.users[userIndex].stats.dmsJoined.push({
    timeStamp: timeStamp,
    numDmsJoined: numDmsJoined,
  });

  setData(data);

  updateInvolvement(authUserId);
}

export function incrementMessageStat(authUserId: number) {
  // find the user and increment the number of channels they are in
  const data = getData();
  const timeStamp = getCurrentTime();
  const userIndex = findUserIndex(authUserId);
  const userStats = data.users[userIndex].stats;

  const [lastMessageSent = { numMessagesSent: 0 }] =
    userStats.messagesSent.slice(-1);

  let numMessagesSent = lastMessageSent.numMessagesSent + 1;

  data.users[userIndex].stats.messagesSent.push({
    timeStamp: timeStamp,
    numMessagesSent: numMessagesSent,
  });

  numMessagesSent = 0;
  if (data.stats.messagesExist.length > 0) {
    numMessagesSent =
      data.stats.messagesExist[data.stats.messagesExist.length - 1]
        .numMessagesExist;
  }

  numMessagesSent++;

  data.stats.messagesExist.push({
    timeStamp: timeStamp,
    numMessagesExist: numMessagesSent,
  });

  setData(data);

  updateInvolvement(authUserId);
}

export function updateInvolvement(authUserId: number) {
  // find the user and increment the number of channels they are in
  const data = getData();
  const userIndex = findUserIndex(authUserId);
  const userStats = data.users[userIndex].stats;
  const workspaceStats = data.stats;

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

  data.users[userIndex].stats.involvementRate =
    denominator === 0 ? 0 : Math.min(numerator / denominator, 1);

  setData(data);
}

export function updateUtilization() {
  const data = getData();
  // The workspace's utilization, which is a ratio of the number of users who have joined at least one channel/DM to the current total number of users, as defined by this pseudocode: numUsersWhoHaveJoinedAtLeastOneChannelOrDm / numUsers

  let usersOneChannelDm = 0;

  data.users.forEach((user) => {
    const numChannelsJoined = user.stats.channelsJoined.length
      ? user.stats.channelsJoined.slice(-1)[0].numChannelsJoined
      : 0;

    const numDmsJoined = user.stats.dmsJoined.length
      ? user.stats.dmsJoined.slice(-1)[0].numDmsJoined
      : 0;

    if (numChannelsJoined > 0 || numDmsJoined > 0) {
      usersOneChannelDm++;
    }
  });

  const numUsers = data.users.length;

  data.stats.utilizationRate =
    numUsers === 0 ? 0 : Math.min(usersOneChannelDm / numUsers, 1);

  setData(data);
}

export function sendNotifDm(
  user: userData,
  message: string,
  allMemberIds: number[],
  dm: dmData
) {
  const data = getData();

  // send notification if there are users tagged
  // tagged: "{User’s handle} tagged you in {channel/DM name}: {first 20 characters of the message}"
  const taggedUsers = message.match(/@([a-zA-Z0-9_]+)/g);
  // avoid duplicate notifications
  if (taggedUsers !== null) {
    const notifiedUsers = new Set(); // keep track of notified users
    taggedUsers.forEach((taggedUser) => {
      const taggedUserIndex = data.users.findIndex(
        (user) => user.handleStr === taggedUser.slice(1)
      );
      if (taggedUserIndex < 0) {
        return;
      }
      const authUserId = data.users[taggedUserIndex].authUserId;
      if (!allMemberIds.includes(authUserId)) {
        return;
      }
      if (notifiedUsers.has(authUserId)) {
        return; // skip notifying the same user again
      }
      const notification = {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: `${user.handleStr} tagged you in ${
          dm.name
        }: ${message.slice(0, 20)}`,
      };
      data.users[taggedUserIndex].notifications.push(notification);
      notifiedUsers.add(authUserId); // add the user to the set of notified users
    });
  }

  setData(data);
}

export function sendNotifChannel(
  user: userData,
  message: string,
  allMemberIds: number[],
  channel: channelData
) {
  const data = getData();

  // send notification if there are users tagged
  // tagged: "{User’s handle} tagged you in {channel/DM name}: {first 20 characters of the message}"
  const taggedUsers = message.match(/@([a-zA-Z0-9_]+)/g);
  // avoid duplicate notifications
  if (taggedUsers !== null) {
    const notifiedUsers = new Set(); // keep track of notified users
    taggedUsers.forEach((taggedUser) => {
      const taggedUserIndex = data.users.findIndex(
        (user) => user.handleStr === taggedUser.slice(1)
      );
      if (taggedUserIndex < 0) {
        return;
      }
      const authUserId = data.users[taggedUserIndex].authUserId;
      if (!allMemberIds.includes(authUserId)) {
        return;
      }
      if (notifiedUsers.has(authUserId)) {
        return; // skip notifying the same user again
      }
      const notification = {
        channelId: channel.channelId,
        dmId: -1,
        notificationMessage: `${user.handleStr} tagged you in ${
          channel.name
        }: ${message.slice(0, 20)}`,
      };
      data.users[taggedUserIndex].notifications.push(notification);
      notifiedUsers.add(authUserId); // add the user to the set of notified users
    });
  }

  setData(data);
}
