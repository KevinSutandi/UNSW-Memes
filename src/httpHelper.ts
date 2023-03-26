import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';

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
