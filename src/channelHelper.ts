import { getData } from './dataStore';

/**
 * @typedef {Object} user - object containing user information to be retuned
 * @property {number} uId - user's unique id
 * @property {string} handleStr - user's handlestring
 * @property {string} email - user's email
 * @property {string} nameFirst - user's first name
 * @property {string} nameLast - user's last name
 */

export interface userObject {
  uId: number;
  handleStr: string;
  email: string;
  nameFirst: string;
  nameLast: string;
}

/**
 * @typedef {Object} channel - object for returning channel information
 * @property {string} name - the channel's name
 * @property {boolean} isPublic - whether the channel is private or not
 * @property {user[]} ownerMembers - the owners of the channel
 * @property {user[]} allMembers - members of the channel
 */

export interface channelObject {
  name: string;
  isPublic: boolean;
  ownerMembers: Array<userObject>;
  allMembers: Array<userObject>;
}

/**
 * @typedef {Object} messagesObject - object for returning channel information
 * @property {number} messageId - the message Id
 * @property {number} uId - the user who sent the message's ID
 * @property {string} message - the message
 * @property {number} timeSent - the time sent in UNIX time
 */

export interface messagesObject {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
}

/**
 * @typedef {Object} messages
 * @property {Array<messagesObject>} messages - includes messageId, uId, the message and time in UNIX time
 * @property {Number} start
 * @property {Number} end
 */

export interface messages {
  messages: Array<messagesObject>;
  start: number;
  end: number;
}

export interface errorMessage {
  error: string;
}

// Helper functions
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
export function findChannel(channelId: number): channelObject {
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
