import { getData, setData } from './dataStore';
import { isUser, getUserByToken } from './functionHelper';
import {
  errorMessage,
  dmCreateReturn
} from './interfaces.js';


export function dmCreateV1 (
    token: string,
    uId: number,
): dmCreateReturn | errorMessage {

    const data = getData();
    const user = getUserByToken(token);

    // error condtions first
    if (user == undefined) {
        return { error: 'invalid token' };
    }
    if (!isUser(uId)) {
        return { error: 'uId does not refer to a valid user'};
    }

    // first check that there are no duplicates, if there is then
    // error
    // i think make helper function that turns it into arry
    // so can check if array is empty, bc then there is only the creater
    const duplicateuId = dataStore.users.find((item) => user.uId === uId);
        if (duplicateuId !== undefined) {
            return { error: 'There are duplicate uIds in uId!' };
        }

    // The name should be an alphabetically-sorted, comma-and-space-separated 
    // list of user handles,
    // use helper function here
    const uIdHandles = // helper function that adds my uid user HANDLES handlestr? into array
    const sortedAlphabetical = uIdHandles.sort();

    // then return new dmId
    const newId = Math.floor(Math.random() * 10000);

    data.dm.push({
        dmId: newId,
        name: sortedAlphabetical,
        ownerMembers: [
            {
                uId: user.authUserId,
                handleStr: user.handleStr,
                email: user.email,
                nameFirst: user.nameFirst,
                nameLast: user.nameLast,
            },
        ],
        allMembers: [
            {
              uId: user.authUserId,
              handleStr: user.handleStr,
              email: user.email,
              nameFirst: user.nameFirst,
              nameLast: user.nameLast,
            },
        ],      
    });
    setData(data);
    return {
        dmId: newId,
    };

}