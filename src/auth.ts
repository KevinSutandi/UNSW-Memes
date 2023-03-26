import validator from 'validator';
import { makeToken } from './functionHelper';
import { AuthReturn, errorMessage, userData } from './interfaces';
import { getData, setData } from './dataStore';

export function authLoginV1(
  email: string,
  password: string
): AuthReturn | errorMessage {
  const dataStore = getData();

  let correctUser: userData;
  for (const user of dataStore.users) {
    if (email === user.email && password === user.password) {
      correctUser = user;
    } else if (email === user.email && password !== user.password) {
      return { error: 'Password is not correct' };
    }
  }
  if (correctUser !== undefined) {
    const token = makeToken();
    correctUser.token.push({ token: token });
    return { authUserId: correctUser.authUserId, token: token };
  }
  return { error: 'Email entered does not belong to a user' };
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
    return { error: 'Please enter valid email!' };
  }

  const emailfound = dataStore.users.find((item) => item.email === email);
  if (emailfound !== undefined) {
    return { error: 'This email address is already used!' };
  }

  if (password.length < 6) {
    return { error: 'Your password is too short!' };
  }

  if (nameFirst.length > 50) {
    return { error: 'Your first name is too long' };
  } else if (nameFirst.length < 1) {
    return { error: 'Your first name is too short' };
  }

  if (nameLast.length > 50) {
    return { error: 'Your last name is too long' };
  } else if (nameLast.length < 1) {
    return { error: 'Your last name is too short' };
  }

  const authId = Math.floor(Math.random() * 10000000);

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
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    isGlobalOwner: isGlobalOwner,
    token: [{ token: token }],
  });

  setData(dataStore);

  return { token: token, authUserId: authId };
}