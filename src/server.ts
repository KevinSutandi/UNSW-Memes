import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';

import {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1,
} from './channels';

import {
  channelMessagesV1,
  channelDetailsV1,
  channelLeaveV1,
  channelJoinV1,
  channelInviteV1,
  channelAddOwnerV1,
  channelRemoveOwnerV1,
} from './channel';
import { messageRemoveV1, messageSendV1, messageEditV1 } from './message';
import {
  setEmail,
  setName,
  setHandle,
  getAllUsers,
  userProfileV2,
} from './users';
import { dmCreateV1 } from './dm';
// import { userProfileV1 } from './users';
import { clearV1 } from './other';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post('/auth/login/v2', (req: Request, res: Response, next) => {
  const { email, password } = req.body;
  const result = authLoginV1(email, password);
  return res.json(result);
});

app.post('/auth/register/v2', (req: Request, res: Response, next) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = authRegisterV1(email, password, nameFirst, nameLast);
  return res.json(result);
});

app.post('/channels/create/v2', (req: Request, res: Response, next) => {
  const { token, name, isPublic } = req.body;
  const result = channelsCreateV1(token, name, isPublic);
  return res.json(result);
});

app.get('/channels/list/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const result = channelsListV1(token);
  return res.json(result);
});

app.get('/channels/listall/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const result = channelsListAllV1(token);
  return res.json(result);
});

app.post('/channel/join/v2', (req: Request, res: Response, next) => {
  const { token, channelId } = req.body;
  const result = channelJoinV1(token, channelId);
  return res.json(result);
});

app.delete('/clear/v1', (req: Request, res: Response, next) => {
  const result = clearV1();
  return res.json(result);
});

app.get('/channel/messages/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  const result = channelMessagesV1(token, channelId, start);
  return res.json(result);
});

app.post('/channel/leave/v1', (req: Request, res: Response, next) => {
  const { token, channelId } = req.body;
  const result = channelLeaveV1(token, channelId);
  return res.json(result);
});

app.post('/channel/addowner/v1', (req: Request, res: Response, next) => {
  const { token, channelId, uId } = req.body;
  const result = channelAddOwnerV1(token, channelId, uId);
  return res.json(result);
});

app.post('/channel/removeowner/v1', (req: Request, res: Response, next) => {
  const { token, channelId, uId } = req.body;
  const result = channelRemoveOwnerV1(token, channelId, uId);
  return res.json(result);
});

app.post('/dm/create/v1', (req: Request, res: Response, next) => {
  const { token, uIds } = req.body;
  const result = dmCreateV1(token, uIds);
  return res.json(result);
});

app.get('/channels/list/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const result = channelsListV1(token);
  return res.json(result);
});

app.get('/channel/details/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  const result = channelDetailsV1(token, channelId);
  return res.json(result);
});

// Will Reenable once user profile is working
// app.get('/user/profile/v2', (req: Request, res: Response, next) => {
//   const token = req.query.token as string;
//   const uId = parseInt(req.query.uId as string);
//   const result = userProfileV1(token, uId);
//   return res.json(result);
// });

app.post('/message/send/v1', (req: Request, res: Response, next) => {
  const { token, channelId, message } = req.body;
  const result = messageSendV1(token, channelId, message);
  return res.json(result);
});

app.post('/channel/invite/v2', (req: Request, res: Response, next) => {
  const { token, channelId, uId } = req.body;
  const result = channelInviteV1(token, channelId, uId);
  return res.json(result);
});

app.delete('/message/remove/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const messageId = parseInt(req.query.messageId as string);
  const result = messageRemoveV1(token, messageId);
  return res.json(result);
});

app.post('/auth/logout/v1', (req: Request, res: Response, next) => {
  const { token } = req.body;
  const result = authLogoutV1(token);
  return res.json(result);
});

app.put('/message/edit/v1', (req: Request, res: Response, next) => {
  const { token, messageId, message } = req.body;
  const result = messageEditV1(token, messageId, message);
  return res.json(result);
});
app.post('/message/send/v1', (req: Request, res: Response, next) => {
  const { token, channelId, message } = req.body;
  const result = messageSendV1(token, channelId, message);
  return res.json(result);
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response, next) => {
  const { token, handleStr } = req.body;
  const result = setHandle(token, handleStr);
  return res.json(result);
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response, next) => {
  const { token, email } = req.body;
  const result = setEmail(token, email);
  return res.json(result);
});

app.put('/user/profile/setname/v1', (req: Request, res: Response, next) => {
  const { token, nameFirst, nameLast } = req.body;
  const result = setName(token, nameFirst, nameLast);
  return res.json(result);
});

app.get('/users/all/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const result = getAllUsers(token);
  return res.json(result);
});

app.get('/user/profile/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const uId = parseInt(req.query.uId as string);
  const result = userProfileV2(token, uId);
  return res.json(result);
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
