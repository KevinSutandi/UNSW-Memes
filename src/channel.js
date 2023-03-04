import { data } from './dataStore';


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

/**
  * Given a channelId of a channel that the authorised user
  * can join, adds them to the channel.
  * 
  * @param {number} authUserId - description of paramter
  * @param {number} channelId - description of parameter
  * ...
  * 
  * @returns {data type} - description of condition for return
  * @returns {data type} - description of condition for return
*/

export function channelJoinV1(authUserId, channelId) {
  function findAuthUser(users) {
    return users.authUserId === authUserId;
  }
  function findChannel(channels) {
    return channels.channelId === channelId;
  }

  const user = data.users.find(findAuthUser);
  const uId = user.uId;
  const getAllUId = data.channels.map(channel =>
    channel.allMembers.map(member => member.uId)
  ).flat();

  if (data.users.find(findAuthUser) === undefined) {
    return { error: 'User Not Found' };
  }
  if (data.channels.find(findChannel) === undefined) {
    return { error: 'Channel Not Found' };
  }
  if (getAllUId.includes(uId) === true) {
    return { error: 'User is already in channel' };
  }







  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  return {

  }
}


function channelDetailsV1(authUserId, channelId) {
  return {
    name: 'Hayden',
    ownerMembers: [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ],
    allMembers: [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ],
  }
}

