import { getData, setData } from './dataStore';
import { isUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
} from './interfaces.js';

export function dmListV1(
    token: string
): dmListReturn | errorMessage {

    const data = getData();
    const user = getUserByToken(token);

    // errors
    if (user === undefined) {
        return { error: 'Invalid token' };
    }

    const userDms: dmListReturn = { dms: [] };


    data.dms.forEach((dm) => {
    const isUserInDm = dm.allMembers.some(
      (member) => member.uId === authUserIdToFind
    );
    if (isUserInDm === true) {
      userDm.dm.push({
        dmId: dm.dmId,
        name: dm.name,
      });
    }
  });
  return userDms;
}
