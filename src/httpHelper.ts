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
export function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  return JSON.parse(res.getBody('utf-8'));
}

export function authRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  return requestHelper('POST', '/auth/register/v2', {
    email,
    password,
    nameFirst,
    nameLast,
  });
}

export function authLogin(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v2', { email, password });
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
  return requestHelper('GET', '/channel/details/v2', { token, channelId });
}

export function channelsList(token: string) {
  return requestHelper('GET', '/channels/list/v2', { token });
}

export function messageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v1', {
    token,
    channelId,
    message,
  });
}

export function messageRemove(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v1', { token, messageId });
}

export function authLogout(token: string) {
  return requestHelper('POST', '/auth/logout/v1', { token });
}


export function dmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v1', { token, dmId });

}



export function messageEdit(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v1', {
    token,
    messageId,
    message,
  });
}
