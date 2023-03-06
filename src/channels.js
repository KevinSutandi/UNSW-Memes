function channelsCreateV1(authUserId, name, isPublic) {
  return {
    channelId: 1,
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

export function channelsListAllV1(authUserId) {
  // If the given userId is invalid
  if (!isUser) {
    return {error: 'Invalid authUserId'};
  }
  return {
    channels: data.channels.map(a => ({
    channelId: a.channelId,
    name: a.name,
    })),
  };
}


