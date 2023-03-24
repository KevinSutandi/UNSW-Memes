import request, { HttpVerb } from 'sync-request';

import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
// const ERROR = { error: expect.any(String) };

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
