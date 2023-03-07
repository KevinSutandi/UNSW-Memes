import { getData, setData } from "./dataStore";

/**
 *
 *
 * @param {number} authUserId - The authenticated user Id
 * @param {number} channelId - The channel Id to join
 * ...
 *
 * @returns {} - returns {} when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    = channelId is invalid
 *                                    = Member is already in channel
 *                                    = Channel is private and not a global owner
 *                                    = User is invalid
 */
export function channelMessagesV1(authUserId, channelId, start) {
  const data = getData();

  // Function for finding the particular authUserId
  function findAuthUser(users) {
    return users.authUserId === authUserId;
  }
  // Function for finding particular channelId
  function findChannel(channels) {
    return channels.channelId === channelId;
  }
  // Get the particular user index in data store
  const user = data.users.find(findAuthUser);
  const uId = user.uId;

  // Get the particular channel index from data store
  const channel = data.channels.find(findChannel);
  // Get the amount of messages in the particular channel
  const channelMessage = channel.messages.length;

  // Get all uIds in the channel
  const allMemberIds = channel
    ? channel.allMembers.map((member) => member.uId)
    : null;
  // Error if the user is not registered
  if (data.users.find(findAuthUser) === undefined) {
    return { error: "User Not Found" };
  }
  // Error if the channel is not found
  if (data.channels.find(findChannel) === undefined) {
    return { error: "Channel Not Found" };
  }
  // Error if the user is not a member of the channel
  if (allMemberIds.includes(uId) === false) {
    return { error: "User is not registered in channel" };
  }
  // Error if 'start' is greater than the amount of messages
  if (start > channelMessage) {
    return { error: "'start' is greater than the amount of messages" };
  }

  if (start + 50 > channelMessage) {
    const messagesLeft = channelMessage - start;
    return {
      messages: channel.messages.slice(start, messagesLeft),
      start: start,
      end: -1,
    };
  } else {
    return {
      messages: channel.messages.slice(start, start + 50),
      start: start,
      end: start + 50,
    };
  }
}

/**
 * Given a channelId of a channel that the authorised user
 * can join, adds them to the channel.
 *
 * @param {number} authUserId - The authenticated user Id
 * @param {number} channelId - The channel Id to join
 * ...
 *
 * @returns {} - returns {} when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    = channelId is invalid
 *                                    = Member is already in channel
 *                                    = Channel is private and not a global owner
 *                                    = User is invalid
 */

export function channelJoinV1(authUserId, channelId) {
  // Function for finding authUserId in data store
  function findAuthUser(users) {
    return users.authUserId === authUserId;
  }
  // Function for finding channelId in data store
  function findChannel(channels) {
    return channels.channelId === channelId;
  }
  const data = getData();

  // Get the particular user index in data store
  const user = data.users.find(findAuthUser);
  const globalPerm = user.isGlobalOwner;
  const uId = user.uId;

  // Get the particular channel index from data store
  const channel = data.channels.find(findChannel);
  const isPublic = channel.isPublic;

  // Get all uIds in the channel
  const allMemberIds = channel
    ? channel.allMembers.map((member) => member.uId)
    : null;
  // Error if the user is not registered
  if (data.users.find(findAuthUser) === undefined) {
    return { error: "User Not Found" };
  }
  // Error if the channel is not found
  if (data.channels.find(findChannel) === undefined) {
    return { error: "Channel Not Found" };
  }
  // Error if the user is already in the channel
  if (allMemberIds.includes(uId) === true) {
    return { error: "User is already in channel" };
  }
  // Error if the channels is private and not global owner
  if (isPublic === false && globalPerm === false) {
    if (isPublic === false) {
      return { error: "Channel is not public" };
    } else {
      return { error: "User is not global owner" };
    }
  }

  // Add the user to the channel
  data.channels[channelId].allMembers.push({
    uId: uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  });
  setData(data);

  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  return {};
}

function channelDetailsV1(authUserId, channelId) {
  return {
    name: "Hayden",
    ownerMembers: [
      {
        uId: 1,
        email: "example@gmail.com",
        nameFirst: "Hayden",
        nameLast: "Jacobs",
        handleStr: "haydenjacobs",
      },
    ],
    allMembers: [
      {
        uId: 1,
        email: "example@gmail.com",
        nameFirst: "Hayden",
        nameLast: "Jacobs",
        handleStr: "haydenjacobs",
      },
    ],
  };
}
