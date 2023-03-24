/**
 * @typedef {Object} user - object containing user information to be retuned
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
}

/**
 * @typedef {Object} channel - object for returning channel information
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

export interface errorMessage {
  error: string;
}
