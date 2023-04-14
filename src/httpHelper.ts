import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';
import { channelsCreateReturn } from './interfaces';

const SERVER_URL = `${url}:${port}`;
// const ERROR = { error: expect.any(String) };

/**
 * Makes a HTTP request to the specified path using the given HTTP verb and payload.
 *
 * @param {string} method - The HTTP verb to use (e.g. 'GET', 'POST', 'PUT', 'DELETE').
 * @param {string} path - The path to send the HTTP request to.
 * @param {object} payload - The payload to include in the HTTP request.
 * @returns {object} - The JSON response from the server.
 */
export function requestHelper(
  method: HttpVerb,
  path: string,
  payload: object,
  headers?: { token: string }
) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, {
    qs,
    json,
    timeout: 20000,
    headers: headers,
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  }

  return JSON.parse(res.getBody() as string);
}

export function authRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  return requestHelper('POST', '/auth/register/v3', {
    email,
    password,
    nameFirst,
    nameLast,
  });
}

export function authLogin(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v3', { email, password });
}

export function clearV1() {
  return requestHelper('DELETE', '/clear/v1', {});
}

export function userProfileV1(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v2', { token, uId });
}
export function channelsCreate(
  token: string,
  name: string,
  isPublic: boolean
): channelsCreateReturn {
  return requestHelper(
    'POST',
    '/channels/create/v3',
    {
      name,
      isPublic,
    },
    { token }
  );
}

export function channelMessage(
  token: string,
  channelId: number,
  start: number
) {
  return requestHelper(
    'GET',
    '/channel/messages/v3',
    {
      channelId,
      start,
    },
    { token }
  );
}

export function channelDetails(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', { channelId }, { token });
}

export function channelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, { token });
}

export function channelsList(token: string) {
  return requestHelper('GET', '/channels/list/v3', {}, { token });
}

export function dmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v2', { dmId }, { token });
}

export function channelsListAll(token: string) {
  return requestHelper('GET', '/channels/listall/v3', {}, { token });
}

export function channelLeave(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', { channelId }, { token });
}

export function channelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper(
    'POST',
    '/channel/addowner/v2',
    {
      channelId,
      uId,
    },
    { token }
  );
}

export function messageSend(token: string, channelId: number, message: string) {
  return requestHelper(
    'POST',
    '/message/send/v2',
    {
      channelId,
      message,
    },
    { token }
  );
}

export function channelInvite(token: string, channelId: number, uId: number) {
  return requestHelper(
    'POST',
    '/channel/invite/v3',
    { channelId, uId },
    { token }
  );
}

export function messageRemove(token: string, messageId: number) {
  return requestHelper(
    'DELETE',
    '/message/remove/v2',
    { messageId },
    { token }
  );
}

export function authLogout(token: string) {
  return requestHelper('POST', '/auth/logout/v2', {}, { token });
}

export function channelRemoveOwner(
  token: string,
  channelId: number,
  uId: number
) {
  return requestHelper(
    'POST',
    '/channel/removeowner/v2',
    {
      channelId,
      uId,
    },
    { token }
  );
}

export function dmCreate(token: string, uIds: Array<number>) {
  return requestHelper('POST', '/dm/create/v2', { uIds }, { token });
}

export function dmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', { dmId, start }, { token });
}

export function dmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v2', { dmId }, { token });
}

export function dmList(token: string) {
  return requestHelper('GET', '/dm/list/v2', {}, { token });
}

export function messageEdit(token: string, messageId: number, message: string) {
  return requestHelper(
    'PUT',
    '/message/edit/v2',
    {
      messageId,
      message,
    },
    { token }
  );
}

export function userProfile(token: string, uId: number) {
  return requestHelper(
    'GET',
    '/user/profile/v3',
    {
      uId,
    },
    { token }
  );
}

export function usersAll(token: string) {
  return requestHelper('GET', '/users/all/v2', {}, { token });
}

export function setName(token: string, nameFirst: string, nameLast: string) {
  return requestHelper(
    'PUT',
    '/user/profile/setname/v2',
    {
      nameFirst,
      nameLast,
    },
    { token }
  );
}

export function setEmail(token: string, email: string) {
  return requestHelper(
    'PUT',
    '/user/profile/setemail/v2',
    { email },
    { token }
  );
}

export function setHandle(token: string, handleStr: string) {
  return requestHelper(
    'PUT',
    '/user/profile/sethandle/v2',
    {
      handleStr,
    },
    { token }
  );
}

export function dmRemove(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { dmId }, { token });
}

export function messageSendDm(token: string, dmId: number, message: string) {
  return requestHelper(
    'POST',
    '/message/senddm/v2',
    {
      dmId,
      message,
    },
    { token }
  );
}

export function standUpStart(token: string, channelId: number, length: number) {
  return requestHelper(
    'POST',
    '/standup/start/v1',
    {
      channelId,
      length,
    },
    { token }
  );
}

export function standUpActive(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { channelId }, { token });
}

export function standUpSend(token: string, channelId: number, message: string) {
  return requestHelper(
    'POST',
    '/standup/send/v1',
    {
      channelId,
      message,
    },
    { token }
  );
}

export function messageSendLater(
  token: string,
  channelId: number,
  message: string,
  timeSent: number
) {
  return requestHelper(
    'POST',
    '/message/sendlater/v1',
    {
      channelId,
      message,
      timeSent,
    },
    { token }
  );
}

export function messageSendLaterDm(
  token: string,
  dmId: number,
  message: string,
  timeSent: number
) {
  return requestHelper(
    'POST',
    '/message/sendlaterdm/v1',
    {
      dmId,
      message,
      timeSent,
    },
    { token }
  );
}

export function messageShare(
  token: string,
  ogMessageId: number,
  message: string,
  channelId: number,
  dmId: number
) {
  return requestHelper(
    'POST',
    '/message/share/v1',
    {
      ogMessageId,
      message,
      channelId,
      dmId,
    },
    { token }
  );
}
