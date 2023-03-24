import { getData, setData } from './dataStore.js';

// HELPER FUNCTIONS

/**
 * @typedef {Object} user - object containing user information to be retuned
 * @property {number} uId - user's unique id
 * @property {string} handleStr - user's handlestring
 * @property {string} email - user's email
 * @property {string} nameFirst - user's first name
 * @property {string} nameLast - user's last name
 */

interface User {
  authUserId: number;
  handleStr: string;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  isGlobalOwner: number;
}

interface Channels {
  channelId?: number;
  name?: string;
}

interface channelsCreateReturn {
  error?: string;
  channelId?: number;
}

interface channelsListReturn {
  error?: string;
  channels?: Channels[];
}

/**
 * Determines whether a user is a valid user
 * by checking through users array in the
 * dataStore.js
 *
 * @param { number } userId - the authenticated user Id
 * @returns {boolean} boolean - true if the user is in the dataStore
 *                            | false if the user isnt in the dataStore
 */
export function isUser(userId: number): boolean {
  const data = getData();
  return data.users.some((a) => a.authUserId === userId);
}

/**
 * Finds the user object based on the given userId
 *
 * @param {number} userId - the authenticated user Id
 * @returns {undefined} - returns undefined if the user isnt in the dataStore
 * @returns {user} - returns user object if the user is in the dataStore
 *
 */
export function findUser(userId: number): User {
  const data = getData();
  return data.users.find((a) => a.authUserId === userId);
}

/**
 * Creates a new channel with the given name,
 * that is either a public or private channel.
 * Then, pushes the created channel into
 * data.channels
 *
 * @param {number} authUserId - the authenticated user Id
 * @param {string} name - the channel's name
 * @param {boolean} isPublic - determines whether the channel is public or private
 * @returns {error: 'error message'} - if the channel's name' length is less than or more than 20
 *                                   = if the given userId is invalid
 * @returns {{channelId: number}} - returns the channelId object
 *
 */
export function channelsCreateV1(
  authUserId: number,
  name: string,
  isPublic: boolean
): channelsCreateReturn {
  // Gets the data from database
  const data = getData();
  // Returns error if name's length is less than 1 or more than 20
  if (name.length < 1 || name.length > 20) {
    return { error: 'Invalid name length' };
  }
  // Returns error if the given userId is invalid
  if (!isUser(authUserId)) {
    return { error: 'Invalid authUserId' };
  }
  const newId = Math.floor(Math.random() * 10000);
  // Finds the user data
  const user = findUser(authUserId);
  // Pushes the new channel's data into data
  data.channels.push({
    channelId: newId,
    name: name,
    isPublic: isPublic,
    ownerMembers: [
      {
        uId: user.authUserId,
        handleStr: user.handleStr,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      },
    ],
    allMembers: [
      {
        uId: user.authUserId,
        handleStr: user.handleStr,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      },
    ],
    messages: [],
    start: 0,
    end: 0,
  });
  setData(data);
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
 * @param {number} authUserId - the authenticated user Id
 *
 * @returns {error: 'error message'} - if the given authUserId is invalid
 * @returns {{channelId: number, name: string}} - returns the details of the channel
 * when successful
 *
 */
export function channelsListV1(authUserId: number): channelsListReturn {
  const data = getData();

  if (!isUser(authUserId)) {
    return { error: 'Invalid authUserId' };
  }

  // need to access our data and pull out all of the channels linked to user
  const authUserIdToFind = authUserId;
  const userChannels: channelsListReturn  = { channels: [] };

  data.channels.forEach((channel) => {
    const isUserInChannel = channel.allMembers.some(
      (member) => member.uId === authUserIdToFind
    );
    if (isUserInChannel === true) {
      userChannels.channels.push({
        channelId: channel.channelId,
        name: channel.name,
      });
    }
  });
  return userChannels;
}

export function channelsListAllV1(authUserId: number): channelsListReturn {
  const data = getData();
  // If the given userId is invalid
  if (!isUser(authUserId)) {
    return { error: 'Invalid authUserId' };
  }
  return {
    channels: data.channels.map((a) => ({
      channelId: a.channelId,
      name: a.name,
    })),
  };
}
