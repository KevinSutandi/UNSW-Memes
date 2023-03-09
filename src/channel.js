import { getData, setData } from "./dataStore"

// Helper functions
// Determines whether the channel is in the database or not
// Returns bool
export function isChannel(channelId) {
  const data = getData()
  return data.channels.some(a => a.channelId === channelId)
}

// Finds the channel obj based on channelId
// Returns obj
export function findChannel(channelId) {
  const data = getData()
  return data.channels.find(a => a.channelId === channelId)
}

// Determines whether the user is in the database or not
// Returns bool
export function isUser(authUserId) {
  const data = getData()
  return data.users.some(a => a.authUserId === authUserId)
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
  }
}

function channelJoinV1(authUserId, channelId) {
  return {}
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
  if (!checkAuthUserIdExists(authUserId) || !checkChannelExistsByChannelId(channelId) || !checkUserExistsByUId(uId)) {
    return { error: 'error' }
  }
  const channels = getData().channels
  let ok = false
  if (channels === undefined) {
    return { error: 'error' }
  }
  channels.forEach(channel => {
    if (channel.channelId === channelId) {
      if (channel.allMembers.includes(authUserId)) {
        channel.allMembers.push(uId)
        ok = true
      }
    }
  })

  if (ok)
    return {}
  return { error: 'error' }
}


export function channelDetailsV1(authUserId, channelId) {
  // Gets the data
  const data = getData()
  // If channelId doesn't refer to a valid channel,
  // returns error
  if (!isChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' }
  }
  // If authUserId is invalid, returns error
  else if (!isUser(authUserId)) {
    return { error: 'Invalid authUserId' }
  }
  const channelObj = findChannel(channelId)
  // If the user is not a member of the channel
  if (!channelObj.allMembers.some(a => a.authUserId === authUserId)) {
    return { error: authUserId + ' is not a member of the channel' }
  }
  return {
    name: channelObj.name,
    isPublic: channelObj.isPublic,
    ownerMembers: channelObj.ownerMembers,
    allMembers: channelObj.allMembers
  }
}