import { getData, setData } from './dataStore';
import { isUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
  dmCreateReturn
} from './interfaces.js';


export function dmCreateV1(
    token: string,
    uIds: Array<uId>
  ): dmCreateReturn | errorMessage {
    const data = getData();
    const user = getUserByToken(token);
    if (!user) {
      return {
        error: 'Invalid token',
      };
    }
  
    // Check if all uIds are valid & not the same
    const uIdsSet = new Set();
    for (const uId of uIds) {
      if (!isUser(uId.uId)) {
        return {
          error: 'Invalid uId',
        };
      }
      if (uIdsSet.has(uId.uId)) {
        return {
          error: 'Duplicate uId',
        };
      }
      uIdsSet.add(uId.uId);
    }
  
    // Set name to list of handlestrings in alphabetical order
    const dmName = uIds
      .map((uId) => data.users[uId.uId].handleStr)
      .sort()
      .join(', ');
  
    // create Array for allMembers just having
    // uId
    // email
    // handleStr
    // nameFirst
    // nameLast
  
    const allMembers = uIds.map((uId) => {
      const user = data.users[uId.uId];
      return {
        uId: user.authUserId,
        email: user.email,
        handleStr: user.handleStr,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      };
    });
  
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
  
    // set data
    setData(data);
    return { dmId: dmId };
  }