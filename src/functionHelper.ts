import { getData } from './dataStore';
import { channelData } from './interfaces';

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
 * @returns {user} - returns user object if the user is in the dataStore
 *
 */
export function findUser(userId: number) {
  const data = getData();
  return data.users.find((a) => a.authUserId === userId);
}

/**
 * Returns an array of member IDs for the specified channel.
 *
 * @param {object} channel - The channel object to retrieve member IDs from.
 * @returns {(Array.<uId>|null)} - An array of member IDs, or null if the channel does not contain any.
 */
export function getAllMemberIds(channel: channelData) {
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
export function getChannelIndex(channelId: number) {
  const data = getData();
  return data.channels.findIndex((channel) => channel.channelId === channelId);
}

export function isChannelMember(channelId: number, userId: number): boolean {
  const channel = findChannel(channelId);
  const allMemberIds = getAllMemberIds(channel);
  return allMemberIds.includes(userId);
}

export function makeToken() {
  const token = Date.now().toString(36) + Math.random().toString(36).substring;
  return token;
}

export function getUserByToken(token: string) {
  const data = getData();
  const tokenFound = data.users.token.find((a) => a.token === token);
  return tokenFound;
}
