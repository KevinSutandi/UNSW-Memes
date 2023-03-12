import validator from 'validator';
import { getData, setData } from './dataStore.js';

export function authLoginV1(email, password) {
  const data = getData();

  let correctUser;
  for (const user of data.users) {
    if (email === user.email && password === user.password) {
      correctUser = user;
    } else if (email === user.email && password !== user.password) {
      return { error: 'Password is not correct' };
    }
  }
  if (correctUser !== undefined) {
    return { authUserId: correctUser.authUserId };
  }
  return { error: 'Email entered does not belong to a user' };
}

/**
 * @param {string} email - the email address
 * @param {string} password - the password
 * @param {string} nameFirst - the firstname
 * @param {string} nameLast - the lastname
 * @returns {error: error message } - different error strings for different situations
 * @returns { authUserId: number } - new authorID who registered
 *
 */

export function authRegisterV1(email, password, nameFirst, nameLast) {
  const dataStore = getData();

  if (validator.isEmail(email) !== true) {
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
  }

  if (nameLast.length > 50) {
    return { error: 'Your last name is too long' };
  }

  const authId = Math.floor(Math.random() * 10000000);
  // the handlestring == firstname+lastname
  // only extract a-z0-9 characters, remove all characters to lowercases
  // limit the authId in 20 characters
  // if the handle is used, append the number at 21th
  // const nameFirst_lowercase = nameFirst.toLowerCase();
  // const nameLast_lowercase = nameLast.toLowerCase();
  let handlestring = nameFirst + nameLast;

  handlestring = handlestring.toLowerCase();
  const regpattern = /[^a-z0-9]/g;
  handlestring = handlestring.replace(regpattern, '');
  // handlestring = handlescleartring.replace(/\W/g, "");

  if (handlestring.length > 20) {
    handlestring = handlestring.substring(0, 20); // exclusive
  }

  const handleMap = dataStore.users.map((user) => user.handleStr);

  for (let i = 0; handleMap.includes(handlestring); i++) {
    handlestring = `${handlestring}${i}`;
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
  });
  setData(dataStore);

  return { authUserId: authId };
}
