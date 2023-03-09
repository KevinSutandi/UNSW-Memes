import { getData, setData } from "./dataStore";

// Helper functions
// Determines whether the channel is in the database or not
// Returns bool
export function isChannel(channelId) {
  const data = getData();
  return data.channels.some((a) => a.channelId === channelId);
}

// Finds the channel obj based on channelId
// Returns obj
export function findChannel(channelId) {
  const data = getData();
  return data.channels.find((a) => a.channelId === channelId);
}

// Determines whether the user is in the database or not
// Returns bool
export function isUser(authUserId) {
  const data = getData();
  return data.users.some((a) => a.authUserId === authUserId);
}

function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [
      {
        messageId: 1,
        uId: 1,
        message: "Hello world",
        timeSent: 1582426789,
      },
    ],
    start: 0,
    end: 50,
  };
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

  // Get the particular channel index from data store
  const channel = data.channels.find(findChannel);

  // Get all uIds in the channel
  const allMemberIds = channel
    ? channel.allMembers.map((member) => member.authUserId)
    : null;
  // Error if the user is not registered
  if (data.users.find(findAuthUser) === undefined) {
    return { error: 'User Not Found' };
  }
  // Error if the channel is not found
  if (data.channels.find(findChannel) === undefined) {
    return { error: 'Channel Not Found' };
  }

  const uId = user.authUserId;

  // Error if the user is already in the channel
  if (allMemberIds.includes(uId) === true) {
    return { error: 'User is already in channel' };
  }

  const isPublic = channel.isPublic;
  const globalPerm = user.isGlobalOwner;
  // Error if the channels is private and not global owner
  if (isPublic === false && globalPerm === 2) {
    if (isPublic === false) {
      return { error: 'Channel is not public' };
    } else {
      return { error: 'User is not global owner' };
    }
  }
  const channelNum = data.channels.findIndex(
    (channel) => channel.channelId === channelId
  );
  // Add the user to the channel
  data.channels[channelNum].allMembers.push({
    authUserId: authUserId,
    authemail: user.authemail,
    authfirstname: user.authfirstname,
    authlastname: user.authlastname,
    handlestring: user.handlestring,
  });
  setData(data);

  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  return {};
}

export function channelDetailsV1(authUserId, channelId) {
  // Gets the data
  const data = getData();
  // If channelId doesn't refer to a valid channel,
  // returns error
  if (!isChannel(channelId)) {
    return { error: "channelId does not refer to a valid channel" };
  }
  // If authUserId is invalid, returns error
  else if (!isUser(authUserId)) {
    return { error: "Invalid authUserId" };
  }
  const channelObj = findChannel(channelId);
  // If the user is not a member of the channel
  if (!channelObj.allMembers.some((a) => a.authUserId === authUserId)) {
    return { error: authUserId + " is not a member of the channel" };
  }
  return {
    name: channelObj.name,
    isPublic: channelObj.isPublic,
    ownerMembers: channelObj.ownerMembers,
    allMembers: channelObj.allMembers,
  };
}
