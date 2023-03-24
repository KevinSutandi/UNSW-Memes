import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { authRegisterV1, authLoginV1 } from './auth';
import { channelsCreateV1, channelsListV1 } from './channels';

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
