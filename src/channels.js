import {getData, setData} from "./dataStore";

// Helper functions
// Finds out whether the given userId is valid or not
// returns bool
export function isUser(userId) {
  const data = getData();
  return data.users.some(a => a.authUserId === userId);
}

export function findUser (userId) {
  const data = getData();
  return data.users.find(a => a.authUserId === userId);
}

export function channelsCreateV1(authUserId, name, isPublic) {
  // Gets the data from database
  const data = getData()
  // Returns error if name's length is less than 1 or more than 20
  if (name.length < 1 || name.length > 20) {
    return {error: 'Invalid name length'};
  }
  if (!isUser) {
    return {error: 'Invalid authUserId'};
  }
  let newId = Math.floor(Math.random() * 10000);
  // Finds the user data
  const user = findUser(authUserId);
  // Pushes the new channel's data into data
  data.channels.push(
    {
      channelId: newId,
      name: name,
      isPublic: isPublic,
      ownerMembers: [
        {
          uId: authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr
        }
      ],
      allMembers: [
        {
          uId: authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr
        }
      ],
      messages: [],
      start: 0,
      end: 0
    }
  )
  setData(data);
  return {
    channelId: newId
  }
}

function channelsListV1(authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  }
}

function channelsListAllV1(authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  }
}

