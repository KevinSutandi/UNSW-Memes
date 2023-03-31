import { getData, setData } from './dataStore';
import { findUser, isUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
  dmCreateReturn,
  userData,
  userObject
} from './interfaces';

export function dmCreateV1(
  token: string,
  uIds: Array<number>
): dmCreateReturn | errorMessage {
  const data = getData();
  const user = getUserByToken(token);
  if (user === undefined) {
    return {
      error: 'Invalid token',
    };
  }

  // Find the user information using findUser
  // make an array to check for duplicates
  const userArray: Array<userData> = [];

  // Make sure that owner does not invite owner
  if (uIds.includes(user.authUserId)) {
    return {
      error: 'Duplicate uId',
    };
  }

  // add owner to userArray
  userArray.push(user);

  for (const uId of uIds) {
    const userUId = findUser(uId);
    if (userUId === undefined) {
      return {
        error: 'Invalid uId',
      };
    }

    if (userArray.includes(userUId)) {
      return {
        error: 'Duplicate uId',
      };
    }
    userArray.push(userUId);
  }

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






export function isDm(dmId: number): boolean {
  const data = getData();
  return data.dm.some((a) => a.dmId === dmId);
}

export function isDmMember(dmId: number, userId: number): boolean {
  const dm = findDm(dmId);
  console.log(dmId);
  const allMemberIds = getAllDmMemberIds(dm);
  console.log(allMemberIds);
  return allMemberIds.includes(userId);
}

export function findDm(dmId: number): dmData | undefined {
  const data = getData();
  return data.dm.find((a) => a.dmId === dmId);
}

export function getAllDmMemberIds(dm: dmData) {
  if (dm) {
    return dm.allMembers.map((member) => member.uId);
  } else {
    return null;
  }
}


export function dmLeaveV1 (
  token: string,
  dmId: number,
) {
  const user = getUserByToken(token);
  if (user === undefined) {
      return { error: 'Invalid token'}
  }
  if (!isDm(dmId)) {
      return { error: 'dmId does not refer to a valid DM' };
  }
  if (!isDmMember(dmId, user.authUserId)) {
      return { error: user.authUserId + ' is not a member of the DM'}
  }

  const dmIndex = data.dm.findIndex(
    (item) => item.dmId === dmId
  );

  const userOwnerIndex = data.dm[dmIndex].ownerMembers.findIndex(
    (item) => item.uId === user.authUserId
  );

  const userMemberIndex = data.dm[dmIndex].allMembers.findIndex(
    (item) => item.uId === user.authUserId
  );

  if (userOwnerIndex !== -1) {
    data.dm[dmIndex].ownerMembers.splice(userOwnerIndex, 1);
  }

  data.dm[dmIndex].allMembers.splice(userMemberIndex, 1);
  setData(data);
  return {};
}