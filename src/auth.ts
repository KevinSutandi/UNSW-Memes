import validator from 'validator';
import HTTPError from 'http-errors';
import { port } from './config.json';
import {
  findTokenIndex,
  getUserByToken,
  makeToken,
  HashingString,
  getUserIndexByToken,
  findUserbyEmail,
  findUserIndex,
  downloadImage,
  getCurrentTime,
  badRequest,
  forbidden,
} from './functionHelper';
import { AuthReturn, errorMessage, userData } from './interfaces';
import { getData, setData } from './dataStore';
const nodemailer = require('nodemailer');

/**
 * Logs the user and then assigns a token to the user
 * @param {string} email - the email address
 * @param {string} password - the password
 * @returns { error : string } error - different error strings for different situations
 * @returns { token: string, authUserId : number } token - the token for the user, authUserId - the authUserId for the user
 */
export function authLoginV1(
  email: string,
  password: string
): AuthReturn | errorMessage {
  const dataStore = getData();

  let correctUser: userData;
  const encryptedPassword = HashingString(password);
  for (const user of dataStore.users) {
    if (email === user.email && encryptedPassword === user.password) {
      correctUser = user;
    } else if (email === user.email && encryptedPassword !== user.password) {
      throw HTTPError(badRequest, 'Password is not correct');
    }
  }
  if (correctUser === undefined) {
    throw HTTPError(badRequest, 'Email does not belong to a valid user');
  }
  const userIndex = dataStore.users.findIndex(
    (item) => item.authUserId === correctUser.authUserId
  );

  const token = HashingString(makeToken());

  dataStore.users[userIndex].token.push({ token: token });
  setData(dataStore);
  return { authUserId: correctUser.authUserId, token: token };
}

/**
 * @param {string} email - the email address
 * @param {string} password - the password
 * @param {string} nameFirst - the firstname
 * @param {string} nameLast - the lastname
 * @returns { error : string } error - different error strings for different situations
 * @returns { token: string, authUserId : number } token - the token for the user, authUserId - the authUserId for the user
 *
 */
export function authRegisterV1(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): AuthReturn | errorMessage {
  const dataStore = getData();

  if (!validator.isEmail(email)) {
    throw HTTPError(badRequest, 'Email is not valid');
  }

  const emailfound = dataStore.users.find((item) => item.email === email);
  if (emailfound !== undefined) {
    throw HTTPError(badRequest, 'Email already exists');
  }

  if (password.length < 6) {
    throw HTTPError(badRequest, 'Password is too short');
  }

  if (nameFirst.length > 50) {
    throw HTTPError(badRequest, 'Your first name is too long');
  } else if (nameFirst.length < 1) {
    throw HTTPError(badRequest, 'Your first name is too short');
  }

  if (nameLast.length > 50) {
    throw HTTPError(badRequest, 'Your last name is too long');
  } else if (nameLast.length < 1) {
    throw HTTPError(badRequest, 'Your last name is too short');
  }

  const authId = Math.floor(Math.random() * 10000000);

  // hash password
  const hashPassword = HashingString(password);

  // Create a random token that is a string and it is unique every time
  const token = makeToken();

  let handlestring = nameFirst + nameLast;

  handlestring = handlestring.toLowerCase();
  const regpattern = /[^a-z0-9]/g;
  handlestring = handlestring.replace(regpattern, '');

  if (handlestring.length > 20) {
    handlestring = handlestring.substring(0, 20);
  }

  const handleMap = dataStore.users.map((user) => user.handleStr);
  const originalHandle = handlestring;
  for (let i = 0; handleMap.includes(handlestring); i++) {
    handlestring = `${originalHandle}${i}`;
  }

  const timeStamp = getCurrentTime();

  let isGlobalOwner = 2;
  if (dataStore.users.length === 0) {
    isGlobalOwner = 1;
    dataStore.stats = {
      channelsExist: [
        {
          numChannelsExist: 0,
          timeStamp: timeStamp,
        },
      ],
      dmsExist: [
        {
          numDmsExist: 0,
          timeStamp: timeStamp,
        },
      ],
      messagesExist: [
        {
          numMessagesExist: 0,
          timeStamp: timeStamp,
        },
      ],
      utilizationRate: 0,
    };
  }

  downloadImage();

  const PORT: number = parseInt(process.env.PORT || port);
  const HOST: string = process.env.IP || 'localhost';

  dataStore.users.push({
    authUserId: authId,
    handleStr: handlestring,
    email: email,
    password: hashPassword,
    nameFirst: nameFirst,
    nameLast: nameLast,
    isGlobalOwner: isGlobalOwner,
    profileImgUrl: `http://${HOST}:${PORT}/img/default.jpg`,
    token: [{ token: token }],
    stats: {
      channelsJoined: [
        {
          numChannelsJoined: 0,
          timeStamp: timeStamp,
        },
      ],
      dmsJoined: [
        {
          numDmsJoined: 0,
          timeStamp: timeStamp,
        },
      ],
      messagesSent: [
        {
          numMessagesSent: 0,
          timeStamp: timeStamp,
        },
      ],
      involvementRate: 0,
    },
    notifications: [],
  });

  setData(dataStore);

  return { token: token, authUserId: authId };
}
/**
 * Logs out the user and then removes the token from the user
 * @param {string} token - the user's token
 * @returns { error : string } error - different error strings for different situations
 */
export function authLogoutV1(token: string): Record<string, never> {
  const data = getData();
  const user = getUserByToken(token);
  const userIndex = getUserIndexByToken(token);
  if (user === undefined) {
    throw HTTPError(forbidden, 'Token is not valid');
  }

  const tokenIndex = findTokenIndex(user, token);
  data.users[userIndex].token.splice(tokenIndex, 1);
  setData(data);
  return {};
}

/**
 * Sends a reset password code to the user's email
 * @param {string} email - the user's email
 */
export function passwordResetRequestV1(email: string) {
  const data = getData();
  const user = findUserbyEmail(email);

  if (user === undefined) {
    return {};
  }

  const resetCode = Math.floor(Math.random() * 10000000).toString();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'memesresetpass@gmail.com',
      pass: 'flntujulglazqoju',
    },
  });

  const mailOptions = {
    from: 'memesresetpass@gmail.com',
    to: email,
    subject: 'Password reset request',
    text: 'Your reset code is ' + resetCode,
  };

  // ignoring the if for coverage as it is not possible to test
  transporter.sendMail(mailOptions, function (error: string) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent');
    }
  });

  const codeIndex = data.resetCodes.findIndex(
    (a) => a.authUserId === user.authUserId
  );

  // If the user hasnt requested a password reset before, just push the resetCode
  // if the user has requested a password reset before, change the previous resetCode
  if (codeIndex === -1) {
    data.resetCodes.push({
      authUserId: user.authUserId,
      resetCode: resetCode,
    });
  } else {
    data.resetCodes[codeIndex].resetCode = resetCode;
  }

  // log out the user from all devices
  const userIndex = findUserIndex(user.authUserId);
  data.users[userIndex].token = [];

  setData(data);
  return {};
}

/**
 * Resets the user's password if the reset password code is correct
 * @param {string} resetCode - the reset code given from the email
 * @param {string} newPassword - the new password
 */
export function passwordResetV1(resetCode: string, newPassword: string) {
  const data = getData();

  const codeIndex = data.resetCodes.findIndex(
    (user) => user.resetCode === resetCode
  );

  if (codeIndex === -1) {
    throw HTTPError(badRequest, 'Invalid reset code');
  }

  if (newPassword.length < 6) {
    throw HTTPError(badRequest, 'Password is too short');
  }

  const userIndex = findUserIndex(data.resetCodes[codeIndex].authUserId);
  const encryptedPassword = HashingString(newPassword);

  data.users[userIndex].password = encryptedPassword;

  data.resetCodes.splice(codeIndex, 1);
  setData(data);
  return {};
}
