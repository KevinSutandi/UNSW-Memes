import { getData } from './dataStore';
import { channelData, dmData, userData, userObject } from './interfaces';
import { v4 as uuidv4 } from 'uuid';

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
export function getAllMemberIds(channel: channelData | dmData): Array<number> {
  if (channel) {
    return channel.allMembers.map((member) => member.uId);
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
  const token = uuidv4();
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
export function findMember(userId: number, channelId: number): userObject {
  const channelFound = findChannel(channelId);
  const memberfound = channelFound.allMembers.find(
    (member) => member.uId === userId
  );
  return memberfound;
}

export function isChannelOwner(userId: number, channelId: number): boolean {
  const channelFound = findChannel(channelId);
  const ownerMembersIds = channelFound.ownerMembers.map((member) => member.uId);
  return ownerMembersIds.includes(userId);
}

export function getAllOwnerIds(channel: channelData | dmData): Array<number> {
  if (channel) {
    return channel.ownerMembers.map((owner) => owner.uId);
  } else {
    return null;
  }
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
