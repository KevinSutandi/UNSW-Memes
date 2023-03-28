
import { getData, setData } from './dataStore';
import { isUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
} from './interfaces.js';


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
    return data.dms.find((a) => a.dmId === dmId);
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


    // whatever the given dmId is, we remove it from our member list,
    // but we dont touch the name

    // so smth like data.dm.delete((a) => a.dmId === dmId);

    return { }
}