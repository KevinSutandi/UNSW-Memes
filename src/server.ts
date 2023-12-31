import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import {
  authRegisterV1,
  authLoginV1,
  authLogoutV1,
  passwordResetRequestV1,
  passwordResetV1,
} from './auth';

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
import {
  messageRemoveV1,
  messageSendV1,
  messageEditV1,
  messageSendDmV1,
  messageSendLaterV1,
  messagePinV1,
  messageUnpinV1,
  searchV1,
  notificationsGetV1,
  messageSendLaterDmV1,
  messageShareV1,
  messageReactV1,
  messageUnreactV1,
} from './message';
import {
  setEmail,
  setName,
  setHandle,
  getAllUsers,
  userProfileV2,
  userProfileUploadPhotoV1,
  userStatsV1,
  usersStatsV1,
} from './users';
import {
  dmCreateV1,
  dmDetailsV1,
  dmListV1,
  dmMessagesV1,
  dmRemoveV1,
  dmLeaveV1,
} from './dm';
// import { userProfileV1 } from './users';
import { clearV1 } from './other';
import { standupActiveV1, standupSendV1, standupStartV1 } from './standup';
import { adminuserPermissionChangeV1, adminuserRemoveV1 } from './admin';

require('dotenv').config();
// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for image use
app.use('/img', express.static('img'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example Route
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

/* ================================================================ */
/* Admin Functions */

app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const uId = parseInt(req.query.uId as string);
  const result = adminuserRemoveV1(token, uId);
  return res.json(result);
});

app.post(
  '/admin/userpermission/change/v1',
  (req: Request, res: Response, next) => {
    const token = req.headers.token as string;
    const { uId, permissionId } = req.body;
    const result = adminuserPermissionChangeV1(token, uId, permissionId);
    return res.json(result);
  }
);

/* ================================================================ */
/* Auth Functions */

app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  const { email, password } = req.body;
  const result = authLoginV1(email, password);
  return res.json(result);
});

app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = authRegisterV1(email, password, nameFirst, nameLast);
  return res.json(result);
});

app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const result = authLogoutV1(token);
  return res.json(result);
});

app.post(
  '/auth/passwordreset/request/v1',
  (req: Request, res: Response, next) => {
    const { email } = req.body;
    const result = passwordResetRequestV1(email);
    return res.json(result);
  }
);

app.post(
  '/auth/passwordreset/reset/v1',
  (req: Request, res: Response, next) => {
    const { resetCode, newPassword } = req.body;
    const result = passwordResetV1(resetCode, newPassword);
    return res.json(result);
  }
);

/* ================================================================ */
/* Channel Functions */

app.post('/channel/addowner/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId, uId } = req.body;
  const result = channelAddOwnerV1(token, channelId, uId);
  return res.json(result);
});

app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const channelId = parseInt(req.query.channelId as string);
  const result = channelDetailsV1(token, channelId);
  return res.json(result);
});

app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId, uId } = req.body;
  const result = channelInviteV1(token, channelId, uId);
  return res.json(result);
});

app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId } = req.body;
  const result = channelJoinV1(token, channelId);
  return res.json(result);
});

app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId } = req.body;
  const result = channelLeaveV1(token, channelId);
  return res.json(result);
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  const result = channelMessagesV1(token, channelId, start);
  return res.json(result);
});

app.post('/channel/removeowner/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId, uId } = req.body;
  const result = channelRemoveOwnerV1(token, channelId, uId);
  return res.json(result);
});

/* ================================================================ */
/* Channels Function */

app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { name, isPublic } = req.body;
  const result = channelsCreateV1(token, name, isPublic);
  return res.json(result);
});

app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const result = channelsListV1(token);
  return res.json(result);
});

app.get('/channels/listall/v3', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const result = channelsListAllV1(token);
  return res.json(result);
});

/* ================================================================ */
/* DM Functions */

app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { uIds } = req.body;
  const result = dmCreateV1(token, uIds);
  return res.json(result);
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const dmId = parseInt(req.query.dmId as string);
  const result = dmDetailsV1(token, dmId);
  return res.json(result);
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { dmId } = req.body;
  const result = dmLeaveV1(token, dmId);
  return res.json(result);
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const result = dmListV1(token);
  return res.json(result);
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  const result = dmMessagesV1(token, dmId, start);
  return res.json(result);
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const dmId = parseInt(req.query.dmId as string);
  const result = dmRemoveV1(token, dmId);
  return res.json(result);
});

/* ================================================================ */
/* Message and Misc. Functions */
app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const messageId = parseInt(req.query.messageId as string);
  const result = messageRemoveV1(token, messageId);
  return res.json(result);
});

app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { messageId, message } = req.body;
  const result = messageEditV1(token, messageId, message);
  return res.json(result);
});
app.post('/message/send/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId, message } = req.body;
  const result = messageSendV1(token, channelId, message);
  return res.json(result);
});

app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { dmId, message } = req.body;
  const result = messageSendDmV1(token, dmId, message);
  return res.json(result);
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { messageId, reactId } = req.body;
  const result = messageReactV1(token, messageId, reactId);
  return res.json(result);
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { messageId, reactId } = req.body;
  const result = messageUnreactV1(token, messageId, reactId);
  return res.json(result);
});

app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { messageId } = req.body;
  const result = messagePinV1(token, messageId);
  return res.json(result);
});

app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { messageId } = req.body;
  const result = messageUnpinV1(token, messageId);
  return res.json(result);
});

app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId, message, timeSent } = req.body;
  const result = messageSendLaterV1(token, channelId, message, timeSent);
  return res.json(result);
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { dmId, message, timeSent } = req.body;
  const result = messageSendLaterDmV1(token, dmId, message, timeSent);
  return res.json(result);
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { ogMessageId, message, channelId, dmId } = req.body;
  const result = messageShareV1(token, ogMessageId, message, channelId, dmId);
  return res.json(result);
});

app.get('/search/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const queryStr = req.query.queryStr as string;
  const result = searchV1(token, queryStr);
  return res.json(result);
});

app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const result = notificationsGetV1(token);
  return res.json(result);
});

app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId, length } = req.body;
  const result = standupStartV1(token, channelId, length);
  return res.json(result);
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const channelId = parseInt(req.query.channelId as string);
  const result = standupActiveV1(token, channelId);
  return res.json(result);
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId, message } = req.body;
  const result = standupSendV1(token, channelId, message);
  return res.json(result);
});

/* ================================================================ */
/* User Functions */
app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { handleStr } = req.body;
  const result = setHandle(token, handleStr);
  return res.json(result);
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { email } = req.body;
  const result = setEmail(token, email);
  return res.json(result);
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { nameFirst, nameLast } = req.body;
  const result = setName(token, nameFirst, nameLast);
  return res.json(result);
});

app.get('/users/all/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const result = getAllUsers(token);
  return res.json(result);
});

app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const uId = parseInt(req.query.uId as string);
  const result = userProfileV2(token, uId);
  return res.json(result);
});

app.post(
  '/user/profile/uploadphoto/v1',
  (req: Request, res: Response, next) => {
    const token = req.headers.token as string;
    const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
    const result = userProfileUploadPhotoV1(
      token,
      imgUrl,
      xStart,
      yStart,
      xEnd,
      yEnd
    );
    return res.json(result);
  }
);

app.get('/user/stats/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const result = userStatsV1(token);
  return res.json(result);
});

app.get('/users/stats/v1', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const result = usersStatsV1(token);
  return res.json(result);
});

/* ================================================================ */
/* Clear Function */
app.delete('/clear/v1', (req: Request, res: Response, next) => {
  const result = clearV1();
  return res.json(result);
});
/* ================================================================ */

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());
// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

process.on('SIGTERM', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

process
  .on('unhandledRejection', () => {
    console.error('Unhandled Rejection at Promise');
  })
  .on('uncaughtException', (err) => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });
