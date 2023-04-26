/**
 * List of all interfaces that are being used in this project
 */

export interface reactsObject {
  reactId: number;
  uIds: Array<number>;
  isThisUserReacted?: boolean;
}

/**
 * @typedef {Object} messagesObject - object for returning channel information
 * @property {number} messageId - the message Id
 * @property {number} uId - the user who sent the message's ID
 * @property {string} message - the message
 * @property {number} timeSent - the time sent in UNIX time
 */

export interface messagesObject {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  isPinned: boolean;
  reacts: Array<reactsObject>;
}

/**
 * @typedef {Object} messages
 * @property {Array<messagesObject>} messages - includes messageId, uId, the message and time in UNIX time
 * @property {Number} start
 * @property {Number} end
 */

export interface messages {
  messages: Array<messagesObject>;
  start: number;
  end: number;
}

export interface standUp {
  standUpActive: boolean;
  standUpLength: number;
  standUpMessage: Array<messagesObject>;
  standUpOwner: number;
}

export interface userStats {
  channelsJoined: Array<{ timeStamp: number; numChannelsJoined: number }>;
  messagesSent: Array<{ timeStamp: number; numMessagesSent: number }>;
  dmsJoined: Array<{ timeStamp: number; numDmsJoined: number }>;
  involvementRate: number;
}

/**
 * @typedef {Object} userData - object containing the full user information in the datastore
 * @property {number} uId - user's unique id
 * @property {string} handleStr - user's handlestring
 * @property {string} email - user's email
 * @property {string} nameFirst - user's first name
 * @property {string} nameLast - user's last name
 */

export interface userData {
  authUserId: number;
  handleStr: string;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  isGlobalOwner: number;
  profileImgUrl: string;
  token: Array<{
    token: string | null;
  }>;
  notifications: Array<{
    channelId: number;
    dmId: number;
    notificationMessage: string;
  }>;
  stats: userStats;
}

/**
 * @typedef {Object} userObject - object containing user information to be retuned in functions
 * @property {number} uId - user's unique id
 * @property {string} handleStr - user's handlestring
 * @property {string} email - user's email
 * @property {string} nameFirst - user's first name
 * @property {string} nameLast - user's last name
 */

export interface userObject {
  uId: number;
  handleStr: string;
  email: string;
  nameFirst: string;
  nameLast: string;
  profileImgUrl: string;
}

/**
 * @typedef {Object} channelData - object for returning channel information in functions
 * @property {number} channelId - the channel's ID
 * @property {string} name - the channel's name
 * @property {boolean} isPublic - whether the channel is private or not
 * @property {user[]} ownerMembers - the owners of the channel
 * @property {user[]} allMembers - members of the channel
 * @property {message[]} messages - messages in the channel
 * @property {number} start - the start index of the messages
 * @property {number} end - the end index of the messages
 */

export interface channelData {
  channelId: number;
  name: string;
  isPublic: boolean;
  ownerMembers: Array<userObject>;
  allMembers: Array<userObject>;
  messages: Array<messagesObject>;
  start: number;
  end: number;
  standUp: standUp;
}

/**
 * @typedef {Object} channelObject - object for returning channel information in functions
 * @property {string} name - the channel's name
 * @property {boolean} isPublic - whether the channel is private or not
 * @property {user[]} ownerMembers - the owners of the channel
 * @property {user[]} allMembers - members of the channel
 */

export interface channelObject {
  name: string;
  isPublic: boolean;
  ownerMembers: Array<userObject>;
  allMembers: Array<userObject>;
}

export interface statsData {
  channelsExist: Array<{ timeStamp: number; numChannelsExist: number }>;
  dmsExist: Array<{ timeStamp: number; numDmsExist: number }>;
  messagesExist: Array<{ timeStamp: number; numMessagesExist: number }>;
  utilizationRate: number;
}

/**
 * Represents a set of channels.
 *
 * @typedef {Object} channels
 * @property {number} channelId - The ID of the channel.
 * @property {string} name - The name of the channel.
 */
export interface channels {
  channelId?: number;
  name?: string;
}

export interface dmData {
  dmId: number;
  name: string;
  ownerMembers: Array<userObject>;
  allMembers: Array<userObject>;
  messages: Array<messagesObject>;
  start: number;
  end: number;
}

export interface errorMessage {
  error: string;
}

export interface channelsCreateReturn {
  channelId: number;
}

export interface channelsListReturn {
  channels: channels[];
}

export interface AuthReturn {
  authUserId: number;
  token: string | null;
}

export interface dmCreateReturn {
  dmId: number;
}
export interface dms {
  dmId?: number;
  name?: string;
}

export interface dmListReturn {
  dms: dms[];
}

export interface uId {
  uId: number;
}

export interface allUsers {
  users: Array<userObject>;
}

export interface newMessageReturn {
  messageId: number;
}

export interface resetCode {
  authUserId: number;
  resetCode: string;
}

export interface newData {
  users: Array<userData>;
  channels: Array<channelData>;
  dm: Array<dmData>;
  stats: statsData;
  resetCodes: Array<resetCode>;
}

export interface notification {
  channelId: number | -1;
  dmId: number | -1;
  notificationMessage: string;
}
