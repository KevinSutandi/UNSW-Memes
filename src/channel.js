import {getData, setData} from "./dataStore";

// Helper functions
// Determines whether the channel is in the database or not
// Returns bool
export function isChannel(channelId) {
  const data = getData();
  return data.channels.some(a => a.channelId === channelId);
}

// Finds the channel obj based on channelId
// Returns obj
export function findChannel(channelId) {
  const data = getData();
  return data.channels.find(a => a.channelId === channelId);
}

// Determines whether the user is in the database or not
// Returns bool
export function isUser(authUserId) {
  const data = getData();
  return data.users.some(a => a.authUserId === authUserId);
}

/*function channelMessagesV1(authUserId, channelId, start) {
=======
function channelMessagesV1(authUserId, channelId, start) {
>>>>>>> 5a78569931129b3da155d27611a1f26022c9c58a
  return {
    messages: [
      {
        messageId: 1,
        uId: 1,
        message: 'Hello world',
        timeSent: 1582426789,
      }
    ],
    start: 0,
    end: 50,
  }
}

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
/*export function channelMessagesV1(authUserId, channelId, start) {
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

/*export function channelJoinV1(authUserId, channelId) {
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
        message: "Hello world",
        timeSent: 1582426789,
      },
    ],
    start: 0,
    end: 50,
  };
}

function channelJoinV1(authUserId, channelId) {
>>>>>>> 5a78569931129b3da155d27611a1f26022c9c58a
  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  return {};
}
*/
export function channelDetailsV1(authUserId, channelId) {
  // Gets the data
  const data = getData();
  // If channelId doesn't refer to a valid channel,
  // returns error
  if (!isChannel(channelId)) {
    return {error: 'channelId does not refer to a valid channel'};
  }
  // If authUserId is invalid, returns error
  else if (!isUser(authUserId)) {
    return {error: 'Invalid authUserId'};
  }
  const channelObj = findChannel(channelId);
  // If the user is not a member of the channel
  if (!channelObj.allMembers.some(a => a.authUserId === authUserId)) {
    return {error: authUserId + ' is not a member of the channel'};
  }
  return {
    name: channelObj.name,
    isPublic: channelObj.isPublic,
    ownerMembers: channelObj.ownerMembers,
    allMembers: channelObj.allMembers
  }
}