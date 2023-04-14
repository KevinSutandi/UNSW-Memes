import validator from 'validator';
import HTTPError from 'http-errors';
import {
  findTokenIndex,
  getUserByToken,
  makeToken,
  HashingString,
  getUserIndexByToken,
} from './functionHelper';
import { AuthReturn, errorMessage, userData } from './interfaces';
import { getData, setData } from './dataStore';

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
      throw HTTPError(400, 'Password is not correct');
    }
  }
  if (correctUser === undefined) {
    throw HTTPError(400, 'Email does not belong to a valid user');
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
    throw HTTPError(400, 'Email is not valid');
  }

  const emailfound = dataStore.users.find((item) => item.email === email);
  if (emailfound !== undefined) {
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

  const handleMap = dataStore.users.map((user) => user.handleStr);
  const originalHandle = handlestring;
  for (let i = 0; handleMap.includes(handlestring); i++) {
    handlestring = `${originalHandle}${i}`;
  }

  let isGlobalOwner = 2;
  if (dataStore.users.length === 0) {
    isGlobalOwner = 1;
  }

  dataStore.users.push({
    authUserId: authId,
    handleStr: handlestring,
    email: email,
    password: hashPassword,
    nameFirst: nameFirst,
    nameLast: nameLast,
    isGlobalOwner: isGlobalOwner,
    token: [{ token: token }],
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
    throw HTTPError(403, 'Token is not valid');
  }

  const tokenIndex = findTokenIndex(user, token);
  data.users[userIndex].token.splice(tokenIndex, 1);
  setData(data);
  return {};
}
