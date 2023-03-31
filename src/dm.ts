import { getData, setData } from './dataStore';
import { isUser, findUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
  dmCreateReturn,
  userData,
  userObject,
} from './interfaces';

export function dmCreateV1(
  token: string,
  uIds: Array<number>
): dmCreateReturn | errorMessage {
  const data = getData();
  const user = getUserByToken(token);
  if (!user) {
    return {
      error: 'Invalid token',
    };
  }

  // Find the user information using findUser
  // make an array to check for duplicates
  const userArray: Array<userData> = [];

  for (const uId of uIds) {
    const user = findUser(uId);
    if (!user) {
      return {
        error: 'Invalid uId',
      };
    }
    if (userArray.includes(user)) {
      return {
        error: 'Duplicate uId',
      };
    }
    userArray.push(user);
  }

  // add owner to userArray
  userArray.push(user);

  // make name with all the user's handleStr that is inside the set
  // and sort it alphabetically
  let dmName = '';
  for (const uId of userArray) {
    dmName += uId.handleStr + ', ';
  }
  dmName = dmName.slice(0, -2);
  dmName = dmName.split(', ').sort().join(', ');

  // create Array for allMembers that is in array
  const allMembers: Array<userObject> = [];
  for (const uId of userArray) {
    allMembers.push({
      uId: uId.authUserId,
      email: uId.email,
      handleStr: uId.handleStr,
      nameFirst: uId.nameFirst,
      nameLast: uId.nameLast,
    });
  }

  // Create new dm
  const dmId = Math.floor(Math.random() * 1000000000);
  data.dm.push({
    dmId: dmId,
    name: dmName,
    ownerMembers: [
      {
        uId: user.authUserId,
        email: user.email,
        handleStr: user.handleStr,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      },
    ],
    allMembers: allMembers,
    messages: [],
    start: 0,
    end: -1,
  });

  console.log(data.dm);

  // set data
  setData(data);
  return { dmId: dmId };
}


export function dmListV1(
  token: string
): dmListReturn | errorMessage {
  const data = getData();
  const user = getUserByToken(token);

    // errors
  if (user === undefined) {
    return { error: 'Invalid token' };
  }
  
  const authUserIdToFind = user.authUserId;
  const userDms: dmListReturn = { dms: [] };

  data.dms.forEach((dm) => {
    const isUserInDm = dm.allMembers.some(
      (member) => member.dmId === authUserIdToFind
    );
    if (isUserInDm === true) {
      userDms.dms.push({
        dmId: dm.dmId,
        name: dm.dmName,
      });
    }
  });
  return userDms;
}