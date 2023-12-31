import { getData, setData } from './dataStore';
import {
  getCurrentTime,
  getUserByToken,
  updateChannelInfo,
  badRequest,
  forbidden,
} from './functionHelper';
import {
  channelsCreateReturn,
  channelsListReturn,
  errorMessage,
} from './interfaces';
import HTTPError from 'http-errors';
/**
 * Creates a new channel with the given name,
 * that is either a public or private channel.
 * Then, pushes the created channel into
 * data.channels
 *
 * @param {string} token - the authenticated user token
 * @param {string} name - the channel's name
 * @param {boolean} isPublic - determines whether the channel is public or private
 * @returns {error: 'error message'} - if the channel's name' length is less than or more than 20
 *                                   = if the given userId is invalid
 * @returns {{channelId: number}} - returns the channelId object
 *
 */
export function channelsCreateV1(
  token: string,
  name: string,
  isPublic: boolean
): channelsCreateReturn | errorMessage {
  // Gets the data from database
  const data = getData();
  // Returns error if name's length is less than 1 or more than 20
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(badRequest, 'Invalid name length');
  }
  const user = getUserByToken(token);
  // Returns error if the given token is invalid
  if (user === undefined) {
    throw HTTPError(forbidden, 'Invalid token');
  }
  const newId = Math.floor(Math.random() * 10000);
  // Finds the user data
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
        profileImgUrl: user.profileImgUrl,
      },
    ],
    allMembers: [
      {
        uId: user.authUserId,
        handleStr: user.handleStr,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        profileImgUrl: user.profileImgUrl,
      },
    ],
    messages: [],
    standUp: {
      standUpActive: false,
      standUpLength: 0,
      standUpMessage: [],
      standUpOwner: -1,
    },
    start: 0,
    end: 0,
  });

  data.stats.channelsExist.push({
    numChannelsExist: data.channels.length,
    timeStamp: getCurrentTime(),
  });

  setData(data);

  // updates user stats
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
export function channelsListV1(
  token: string
): channelsListReturn | errorMessage {
  const data = getData();
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(forbidden, 'Invalid token');
  }

  // need to access our data and pull out all of the channels linked to user
  const authUserIdToFind = user.authUserId;
  const userChannels: channelsListReturn = { channels: [] };

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

/**
 *
 * @param {string} token - The authentication token of the user making the request.
 * @returns {channelsListReturn | errorMessage} Returns an object containing an array
 *                                              of channel objects with their IDs and names, or an error message if the token is invalid.
 */
export function channelsListAllV1(
  token: string
): channelsListReturn | errorMessage {
  const data = getData();
  // invalid token
  const user = getUserByToken(token);
  if (user === undefined) {
    throw HTTPError(forbidden, 'Invalid token');
  }
  return {
    channels: data.channels.map((a) => ({
      channelId: a.channelId,
      name: a.name,
    })),
  };
}
