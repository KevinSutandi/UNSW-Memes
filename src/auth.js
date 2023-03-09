import { validator } from "validator";
import { getData, setData } from "./dataStore";

export function authLoginV1(email, password) {
  const data = getData()

  //const userfound = data.users.find((item => item.email === email) && (item => item.password === password))
  //const userfound = users.()
  data.users.forEach(user => {
    console.log(user);
    console.log((email === user.authemail) && (password === user.authpw));
    //console.log(password === user.authpw);
    if (((email === user.authemail) === true && (password === user.authpw) === true)) {
      return { authUserId: user.authUserId }
    }
    else {
      return { error: 'error' };
    }
  })
  /*if (userfound !== undefined) {
    return {authUserId: data.users.authId};
  } else {*/
  //}
}


export function authRegisterV1(email, password, nameFirst, nameLast) {
  const dataStore = getData();

  const validator = require("validator");
  if (validator.isEmail(email) !== true) {
    return { error: "Please enter valid email!" };
  }

  const emailfound = dataStore.users.find((item) => item.authemail === email);
  if (emailfound !== undefined) {
    return { error: "This email address is already used!" };
  }

  if (password.length < 6) {
    return { error: "Your password is too short!" };
  }

  if (nameFirst.length > 50) {
    return { error: "Your first name is too long" };
  }

  if (nameLast.length > 50) {
    return { error: "Your last name is too long" };
  }

  let authId = Math.floor(Math.random() * 10000000);
  // the handlestring == firstname+lastname
  // only extract a-z0-9 characters, remove all characters to lowercases
  // limit the authId in 20 characters
  // if the handle is used, append the number at 21th
  // const nameFirst_lowercase = nameFirst.toLowerCase();
  // const nameLast_lowercase = nameLast.toLowerCase();
  let handlestring = nameFirst + nameLast;

  handlestring = handlestring.toLowerCase();
  const regpattern = /[^a-z0-9]/g;
  handlestring = handlestring.replace(regpattern, "");
  // handlestring = handlestring.replace(/\W/g, "");

  if (handlestring.length > 20) {
    handlestring = handlestring.substring(0, 20); // exclusive
  }

  const handlefound = dataStore.users.find(
    (item) => item.handlestring === handlestring
  );
  if (handlefound !== undefined) {
    for (let i = 0; handlefound === undefined; i++) {
      handlestring = handlestring + num.toString(i);
    }
  }
  let isGlobalOwner = 2;
  if (dataStore.users.length === 0) {
    isGlobalOwner = 1;
  }

  dataStore.users.push({
    authUserId: authId,
    handlestring: handlestring,
    authemail: email,
    authpw: password,
    authfirstname: nameFirst,
    authlastname: nameLast,
    isGlobalOwner: isGlobalOwner,
  });
  setData(dataStore);

  return { authUserId: authId };
}


