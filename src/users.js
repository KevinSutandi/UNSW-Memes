import { getData, setData } from "./dataStore"

// check if authUserId exists
export function isUser(userId) {
    const data = getData();
    return data.users.some(a => a.authUserId === userId);
  }

export function userProfileV1( authUserId, uId ) {
    // function to check user is valid and correct
    if (!isUser(authUserId)) {
        return { error: 'Invalid authUserId' }
    }
    // need to get a thing to check zid and make sure it is valid
    if (!isUser(uId)) {
        return { error: 'Invalid uId' }
    }
    // if both are valid, we return information about the user accessing from our data
    return { 
        users: data.users.map(a => ({
            uId: a.uId,
            email: a.email,
            nameFirst: a.nameFirst,
            nameLast: a.nameLast,
            handleStr: a.handleStr,  
        })) 
    }
}