import { getData, setData } from './dataStore';

// HELPER FUNCTIONS

/**
 * @typedef {Object} user - object containing user information
 * @property {number} authUserId - the authenticated user Id
 * @property {number} age - age of the user
 * @property {string} handlestring - user's handlestring
 * @property {string} authemail - user's email
 * @property {string} authpw - user's password
 * @property {string} authfirstname - user's first name
 * @property {string} authlastname - user's last name
 * @property {number} isGlobalOwner - determines whether a user is a global owner
*/

/**
  * Determines whether a user is a valid user
  * by checking through users array in the 
  * dataStore.js
  * 
  * @param {number} userId - the authenticated user Id
  * @returns {boolean} - true if the user is in the dataStore
  *                    = false if the user isnt in the dataStore
*/
export function isUser(userId) {
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
export function findUser(userId) {
  const data = getData();
  return data.users.find((a) => a.authUserId === userId);
}

export function channelsCreateV1(authUserId, name, isPublic) {
  // Gets the data from database
  const data = getData();
  // Returns error if name's length is less than 1 or more than 20
  if (name.length < 1 || name.length > 20) {
    return { error: 'Invalid name length' };
  }
  if (!isUser(authUserId)) {
    return { error: 'Invalid authUserId' };
  }
  let newId = Math.floor(Math.random() * 10000);
  // Finds the user data
  const user = findUser(authUserId);
  // Pushes the new channel's data into data
  data.channels.push({
    channelId: newId,
    name: name,
    isPublic: isPublic,
    ownerMembers: [
      {
        authUserId: user.authUserId,
        handlestring: user.handlestring,
        authemail: user.authemail,
        authfirstname: user.authfirstname,
        authlastname: user.authlastname,
      },
    ],
    allMembers: [
      {
        authUserId: user.authUserId,
        handlestring: user.handlestring,
        authemail: user.authemail,
        authfirstname: user.authfirstname,
        authlastname: user.authlastname,
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
export function channelsListV1(authUserId) {
  const data = getData();

  if (!isUser(authUserId)) {
    return { error: 'Invalid authUserId' };
  }

  // need to access our data and pull out all of the channels linked to user
  const authUserIdToFind = authUserId;
  const userChannels = { channels: [] };
  let channelNum = 0;

  data.channels.forEach((channel) => {
    const isUserInChannel = channel.allMembers.some(
      (member) => member.authUserId === authUserIdToFind
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

export function channelsListAllV1(authUserId) {
  const data = getData();
  // If the given userId is invalid
  if (!isUser(authUserId)) {
    return {error: 'Invalid authUserId'};
  }
  return {
    channels: data.channels.map(a => ({
    channelId: a.channelId,
    name: a.name,
    })),
  };
}


