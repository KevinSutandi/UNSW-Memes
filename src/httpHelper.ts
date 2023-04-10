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
  headers?: string
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
    headers: { headers },
  });
  if (res.statusCode !== 200) {
    // Return error code number instead of object in case of error.
    // (just for convenience)
    return res.statusCode;
  }

  return JSON.parse(res.getBody() as string);
  // return JSON.parse(res.getBody('utf-8'));
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
  return requestHelper('POST', '/channels/create/v2', {
    token,
    name,
    isPublic,
  });
}

export function channelMessage(
  token: string,
  channelId: number,
  start: number
) {
  return requestHelper('GET', '/channel/messages/v2', {
    token,
    channelId,
    start,
  });
}

export function channelDetails(token: string, channelId: number) {
  return requestHelper(
    'GET',
    '/channel/details/v3',
    { token, channelId },
    token
  );
}

export function channelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v2', { token, channelId });
}

export function channelsList(token: string) {
  return requestHelper('GET', '/channels/list/v2', { token });
}

export function dmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v1', { token, dmId });
}

export function channelsListAll(token: string) {
  return requestHelper('GET', '/channels/listall/v2', { token });
}

export function channelLeave(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v1', { token, channelId });
}

export function channelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v1', {
    token,
    channelId,
    uId,
  });
}

export function messageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v1', {
    token,
    channelId,
    message,
  });
}

export function channelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v2', { token, channelId, uId });
}

export function messageRemove(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v1', { token, messageId });
}

export function authLogout(token: string) {
  return requestHelper('POST', '/auth/logout/v1', { token });
}

export function channelRemoveOwner(
  token: string,
  channelId: number,
  uId: number
) {
  return requestHelper('POST', '/channel/removeowner/v1', {
    token,
    channelId,
    uId,
  });
}

export function dmCreate(token: string, uIds: Array<number>) {
  return requestHelper('POST', '/dm/create/v1', { token, uIds });
}

export function dmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v1', { token, dmId, start });
}

export function dmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v1', { token, dmId });
}

export function dmList(token: string) {
  return requestHelper('GET', '/dm/list/v1', { token });
}

export function messageEdit(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v1', {
    token,
    messageId,
    message,
  });
}

export function userProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v2', {
    token,
    uId,
  });
}

export function usersAll(token: string) {
  return requestHelper('GET', '/users/all/v1', { token });
}

export function setName(token: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/user/profile/setname/v1', {
    token,
    nameFirst,
    nameLast,
  });
}

export function setEmail(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v1', { token, email });
}

export function setHandle(token: string, handleStr: string) {
  return requestHelper('PUT', '/user/profile/sethandle/v1', {
    token,
    handleStr,
  });
}

export function dmRemove(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v1', { token, dmId });
}

export function messageSendDm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v1', {
    token,
    dmId,
    message,
  });
}
