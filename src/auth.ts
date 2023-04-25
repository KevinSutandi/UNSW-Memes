import { PrismaClient } from '@prisma/client';
import HTTPError from 'http-errors';
import validator from 'validator';
import {
  HashingString,
  downloadImage,
  getCurrentTime,
  getUserByToken,
  makeToken,
} from './functionHelper';
import { port } from './config.json';

const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

/**
 * @param {string} email - the email address
 * @param {string} password - the password
 * @param {string} nameFirst - the firstname
 * @param {string} nameLast - the lastname
 * @returns { error : string } error - different error strings for different situations
 * @returns { token: string, authUserId : number } token - the token for the user, authUserId - the authUserId for the user
 *
 */
export async function authRegisterV1(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): Promise<{ authUserId: number; token: string }> {
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Email is not valid');
  }

  const user = await prisma.users.findUnique({
    where: { email: email },
  });

  if (user !== null) {
    throw HTTPError(400, 'Email already exists');
  }

  if (password.length < 6) {
    throw HTTPError(400, 'Password is too short');
  }

  if (nameFirst.length > 50) {
    throw HTTPError(400, 'Your first name is too long');
  } else if (nameFirst.length < 1) {
    throw HTTPError(400, 'Your first name is too short');
  }

  if (nameLast.length > 50) {
    throw HTTPError(400, 'Your last name is too long');
  } else if (nameLast.length < 1) {
    throw HTTPError(400, 'Your last name is too short');
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

  const handleMap = await prisma.users.findMany({
    select: { handleStr: true },
  });
  const originalHandle = handlestring;
  for (
    let i = 0;
    handleMap.some((user) => user.handleStr === handlestring);
    i++
  ) {
    handlestring = `${originalHandle}${i}`;
  }

  const timeStamp = getCurrentTime();

  let isGlobalOwner = 2;
  const userCount = await prisma.users.count();
  if (userCount === 0) {
    isGlobalOwner = 1;

    await prisma.stats.create({
      data: {
        channelsExist: {
          create: {
            numChannelsExist: 0,
            timeStamp: timeStamp,
          },
        },
        dmsExist: {
          create: {
            numDmsExist: 0,
            timeStamp: timeStamp,
          },
        },
        messagesExist: {
          create: {
            numMessagesExist: 0,
            timeStamp: timeStamp,
          },
        },
      },
    });
  }

  downloadImage();

  const PORT: number = parseInt(process.env.PORT || port);
  const HOST: string = process.env.IP || 'localhost';

  const userStats = await prisma.userStats.create({
    data: {
      channelsJoined: {
        create: {
          numChannelsJoined: 0,
          timeStamp: timeStamp,
        },
      },
      messagesSent: {
        create: {
          numMessagesSent: 0,
          timeStamp: timeStamp,
        },
      },
      dmsJoined: {
        create: {
          numDmsJoined: 0,
          timeStamp: timeStamp,
        },
      },
      involvementRate: 0,
    },
  });

  await prisma.users.create({
    data: {
      authUserId: authId,
      handleStr: handlestring,
      email: email,
      password: hashPassword,
      nameFirst: nameFirst,
      nameLast: nameLast,
      isGlobalowner: isGlobalOwner,
      profileImgUrl: `http://${HOST}:${PORT}/img/default.jpg`,
      token: {
        create: {
          token: token,
        },
      },
      stats: {
        connect: { id: userStats.id },
      },
      notifications: {
        create: [],
      },
    },
  });

  return { authUserId: authId, token: token };
}

/**
 * Logs the user and then assigns a token to the user
 * @param {string} email - the email address
 * @param {string} password - the password
 * @returns { error : string } error - different error strings for different situations
 * @returns { token: string, authUserId : number } token - the token for the user, authUserId - the authUserId for the user
 */
export async function authLoginV1(email: string, password: string) {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    return { error: 'Email does not belong to a valid user' };
  }

  const encryptedPassword = HashingString(password);
  if (encryptedPassword !== user.password) {
    return { error: 'Password is not correct' };
  }

  const token = makeToken();
  await prisma.users.update({
    where: { id: user.id },
    data: { token: { create: { token } } },
  });

  return { authUserId: user.authUserId, token: token };
}

/**
 * Logs out the user and then removes the token from the user
 * @param {string} token - the user's token
 * @returns { error : string } error - different error strings for different situations
 */
export async function authLogoutV1(token: string) {
  const user = await getUserByToken(token);

  if (user == null) {
    throw HTTPError(403, 'Token is not valid');
  }

  await prisma.token.delete({
    where: {
      id: user.id,
    },
  });

  return {};
}

/**
 * Sends a reset password code to the user's email
 * @param {string} email - the user's email
 */
export async function passwordResetRequestV1(email: string) {
  const user = await prisma.users.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
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
    /* istanbul ignore if */
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent');
    }
  });

  await prisma.resetCodes.upsert({
    where: { authUserId: user.authUserId },
    create: {
      authUserId: user.authUserId,
      resetCode: resetCode,
    },
    update: {
      resetCode: resetCode,
    },
  });

  // log out the user from all devices
  await prisma.users.update({
    where: {
      authUserId: user.authUserId,
    },
    data: {
      token: null,
    },
  });

  return {};
}

/**
 * Resets the user's password if the reset password code is correct
 * @param {string} resetCode - the reset code given from the email
 * @param {string} newPassword - the new password
 */

export async function passwordResetV1(resetCode: string, newPassword: string) {
  const code = await prisma.resetCodes.findUnique({
    where: {
      resetCode: resetCode,
    },
  });

  if (!resetCode) {
    throw HTTPError(400, 'Invalid reset code');
  }

  if (newPassword.length < 6) {
    throw HTTPError(400, 'Password is too short');
  }

  const user = await prisma.users.findUnique({
    where: {
      authUserId: code.authUserId,
    },
  });

  if (!user) {
    throw HTTPError(400, 'User not found');
  }

  const encryptedPassword = HashingString(newPassword);

  await prisma.users.update({
    where: {
      authUserId: user.authUserId,
    },
    data: {
      password: encryptedPassword,
    },
  });

  await prisma.resetCodes.delete({
    where: {
      resetCode: code.resetCode,
    },
  });

  return {};
}
