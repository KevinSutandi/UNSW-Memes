import { getData, setData } from "./dataStore";

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
    return { error: "User Not Found" };
  }
  // Error if the channel is not found
  if (data.channels.find(findChannel) === undefined) {
    return { error: "Channel Not Found" };
  }

  const uId = user.authUserId;

  // Error if the user is already in the channel
  if (allMemberIds.includes(uId) === true) {
    return { error: "User is already in channel" };
  }

  const isPublic = channel.isPublic;
  const globalPerm = user.isGlobalOwner;
  // Error if the channels is private and not global owner
  if (isPublic === false && globalPerm === 2) {
    if (isPublic === false) {
      return { error: "Channel is not public" };
    } else {
      return { error: "User is not global owner" };
    }
  }
  const channelNum = data.channels.findIndex(
    (channel) => channel.channelId === channelId
  );
  // Add the user to the channel
  data.channels[channelNum].allMembers.push({
    authUserId: authUserId,
    email: user.authemail,
    nameFirst: user.authfirstname,
    nameLast: user.authlastname,
    handleStr: user.handlestring,
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
