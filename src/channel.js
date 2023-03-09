import { getData, setData } from './dataStore';

/**
 * @typedef {Object} channel - object containing channel's information
 * @property {number} channelId - the authenticated channel Id
 * @property {string} name - the channel's name
 * @property {boolean} isPublic - whether the channel is private or not
 * @property {user[]} ownerMembers - the owners of the channel
 * @property {user[]} allMembers - members of the channel
 * @property {string[]} messages - messages in the channel
 * @property {number} start - the start of the message
 * @property {number} end - the end of the message
*/

// Helper functions
/**
  * Determines whether a channel is a valid channel
  * by checking through channels array in the 
  * dataStore.js
  * 
  * @param {number} channelId - The authenticated channel Id
  * @returns {boolean} - true if the channel is in the dataStore,
  *                    = false if the channel isnt in the dataStore
  * 
*/
export function isChannel(channelId) {
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
export function findChannel(channelId) {
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
export function isUser(authUserId) {
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
export function findUser(userId) {
  const data = getData();
  return data.users.find((a) => a.authUserId === userId);
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

  // Get the particular channel index from data store
  const channel = data.channels.find(findChannel);
  // Get the amount of messages in the particular channel

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
  const channelMessage = channel.messages.length;
  const uId = user.authUserId;
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


function checkChannelExistsByChannelId(channelId) {
  const channels = getData().channels

  let channel_exists = false

  if (channels) {
    channels.forEach(channel => {
      if (channel.channelId === channelId) {
        channel_exists = true
      }
    })
  }

  return channel_exists
}

function checkUserExistsByUId(uId) {
  const users = getData().users

  let user_exists = false

  if (users) {
    users.forEach(user => {
      if (user.uId === uId) {
        user_exists = true
      }
    })
  }

  return user_exists
}

function checkAuthUserIdExists(authUserId) {
  const channels = getData().channels

  let user_exists = false

  if (channels) {
    channels.forEach(channel => {
      if (channel.allMembers.includes(authUserId)) {
        user_exists = true
      }
    })
  }

  return user_exists
}

export function channelInviteV1(authUserId, channelId, uId) {
  const data = getData();
  // Error cases
  if (!isChannel(channelId)) {
    return {error: 'channelId does not refer to a valid channel'};
  }
  else if (!isUser(uId)) {
    return {error: 'uId does not refer to a valid user'};
  }
  else if (data.channels.allMembers.some((a) => a.authUserId === uId)) {
    return {error: 'User already in the channel'};
  }
  else if (isChannel(channelId) && !data.channels.allMembers.some((a) => a.authUserId === authUserId)) {
    return {error: 'You are not a channel member'};
  }
  else if (!isUser(authUserId)) {
    return {error: 'Invalid authUserId'}
  }
  // Finds the user based on uId
  const user = findUser(uId);
  const channelNum = data.channels.findIndex(
    (channel) => channel.channelId === channelId
  );
  // Adds the user to the channel
  data.channels[channelNum].allMembers.push({
    authUserId: user.authUserId,
    authemail: user.authemail,
    authfirstname: user.authfirstname,
    authlastname: user.authlastname,
    handlestring: user.handlestring,
  });
  setData(data);
}


/**
 *
 *
 * @param {number} authUserId - The authenticated user Id
 * @param {number} channelId - The channel Id to join
 *
 * @returns {name: string, isPublic: boolean, ownerMembers: string, allMembers: string} - returns the details
 * of the channel when successful
 * @returns {error : 'error message'} - returns an error when
 *                                    = channelId is invalid
 *                                    = User is not a member of the channel
 *                                    = User is invalid
 */
export function channelDetailsV1(authUserId, channelId) {
  // Gets the data
  const data = getData()
  // If channelId doesn't refer to a valid channel,
  // returns error
  if (!isChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }
  // If authUserId is invalid, returns error
  else if (!isUser(authUserId)) {
    return { error: 'Invalid authUserId' };
  }
  const channelObj = findChannel(channelId)
  // If the user is not a member of the channel
  if (!channelObj.allMembers.some((a) => a.authUserId === authUserId)) {
    return { error: authUserId + ' is not a member of the channel' };
  }
  return {
    name: channelObj.name,
    isPublic: channelObj.isPublic,
    ownerMembers: channelObj.ownerMembers,
    allMembers: channelObj.allMembers,
  };
}
