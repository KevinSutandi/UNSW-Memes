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

function channelMessagesV1(authUserId, channelId, start) {
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

function channelJoinV1(authUserId, channelId) {
  return {

  }
}

function channelInviteV1(authUserId, channelId, uId) {
  return {

  }
}


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
    channel: channelObj
  };
}

