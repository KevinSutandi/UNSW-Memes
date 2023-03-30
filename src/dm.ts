import { getData, setData } from './dataStore';
import { isUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
} from './interfaces.js';


// helper functions

export function isDm(dmId: number): boolean {
    const data = getData();
    return data.dm.some((a) => a.dmId === dmId);
}

export function isDmMember(dmId: number, userId: number): boolean {
    const dm = findDm(dmId);
    console.log(dmId);
    const allMemberIds = getAllMemberIds(dm);
    console.log(allMemberIds);
    return allMemberIds.includes(userId);
}
  
export function findDm(dmId: number): dmData | undefined {
    const data = getData();
    return data.dm.find((a) => a.dmId === dmId);
}

export function getAllMemberIds(dm: dmData) {
    if (dm) {
      return dm.allMembers.map((member) => member.uId);
    } else {
      return null;
    }
}

export function findDm(dmId: number): dmData | undefined {
    const data = getData();
    return data.dm.find((a) => a.dmId === dmId);
}


// main function

export function dmMessagesV1(
    token: string,
    dmId: number,
    start: number,
) {
    const user = getUserByToken(token);

    if (user === undefined) {
        return { error: 'Invalid token' };
    }
    if (!isDm(dmId)) {
        return { error: 'dmId does not refer to a valid DM' };
    }
    if (!isDmMember(dmId, user.authUserId)) {
        return { error: user.authUserId + ' is not a member of the DM'}
    }
    
    const dmMessages = dm.messages.length;
    const uId = user.authUserId;

    if (start > dmMessages) {
        return { error: "'start' is greater than the amount of messages"}
    }
    if (start + 50 > dmMessages) {
        return {
            messages: dm.messages.slice(start),
            start: start,
            end: -1,
        };
    } else {
        return {
            messages: dm.messages.slice(start, start + 50),
            start: start,
            end: start + 50,
        };
    }

}