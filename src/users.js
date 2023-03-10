import { getData, setData } from "./dataStore.js";

// check if authUserId exists
export function isUser(userId) {
  const data = getData();
  return data.users.some((a) => a.authUserId === userId);
}

export function userProfileV1(authUserId, uId) {
  const data = getData();
  // function to check user is valid and correct
  if (!isUser(authUserId)) {
    return { error: "Invalid authUserId" };
  }
  // need to get a thing to check zid and make sure it is valid
  if (!isUser(uId)) {
    return { error: "Invalid uId" };
  }

  const userNum = data.users.findIndex((a) => a.authUserId === uId);
  // if both are valid, we return information about the user accessing from our data
  return {
    uId: data.users[userNum].authUserId,
    email: data.users[userNum].email,
    nameFirst: data.users[userNum].nameFirst,
    nameLast: data.users[userNum].nameLast,
    handleStr: data.users[userNum].handleStr,
  };
}
