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


function channelDetailsV1(authUserId, channelId) {
  // If channelId doesn't refer to a valid channel,
  // returns error
  if (!findChannel) {
    return {error: 'channelId does not refer to a valid channel'};
  }
  // If authUserId is invalid, returns error
  else if (!isUser) {
    return {error: 'Invalid authUserId'};
  }
  const channelObj = findCourse(channelId);
  // If the user is not a member of the channel
  if (!channelObj.users.some(a => a.authUserId === authUserId)) {
    return {error: authUserId + ' is not a member of the channel'};
  }

  return {
    channel: channelObj
  };
}

