// YOU SHOULD MODIFY THIS OBJECT BELOW

interface users {
  authUserId: number;
  handleStr: string;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  isGlobalOwner: number;
  token: Array<{
    token: string;
  }>;
}

interface Channel {
  channelId: number;
  name: string;
  isPublic: boolean;
  ownerMembers: Array<{
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }>;
  allMembers: Array<{
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }>;
  messages: Array<{
    messageId: number;
    uId: number;
    message: string;
    timeSent: number;
  }>;
  start: number;
  end: number;
}

interface newData {
  users: Array<users>;
  channels: Array<Channel>;
}

let data: { users: users[]; channels: Channel[] } = {
  users: [],
  channels: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: newData) {
  data = newData;
}

export { getData, setData };
