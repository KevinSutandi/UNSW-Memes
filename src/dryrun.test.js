import { authLoginV1, authRegisterV1 } from "./auth.js";

import {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1,
} from "./channels.js";

import {
  channelJoinV1,
  channelInviteV1,
  channelMessagesV1,
  channelDetailsV1,
} from "./channel.js";

import { clearV1 } from "./other.js";

describe("testing return for clear", () => {  
  authRegisterV1("email@email.com", "password", "first", "last");
  clearV1();
  authRegisterV1("email@email.com", "password", "first", "last");
  clearV1(); 
}) 

describe("testing type returned for authRegisterV1", () => {
  beforeEach(() => {
    clearV1();
  });

  test("Test output type definition", () => {
    let data = authRegisterV1(
      "onlyfortest00@gmail.com",
      "testpw0000",
      "EL_001",
      "YIU"
    );
    expect(typeof data === "object").toBe(true);
    expect("authUserId" in data).toBe(true);
    expect(typeof data.authUserId === "number").toBe(true);
  });
});

describe("testing type returned for channelsCreate", () => {
  beforeEach(() => {
    clearV1();
  });

  test("Test output type definition", () => {
    let data = authRegisterV1(
      "onlyfortest00@gmail.com",
      "testpw0000",
      "EL_001",
      "YIU"
    );
    let channel = channelsCreateV1(data.authUserId, 'dongo', true);
    expect(typeof channel === "object").toBe(true);
    expect("channelId" in channel).toBe(true);
    expect(typeof channel.channelId === "number").toBe(true);
  });
});

describe("testing type returned for channelsList", () => {
  beforeEach(() => {
    clearV1();
  });

  test("Test output type definition", () => {
    const name = "dongo";
    let data = authRegisterV1(
      "onlyfortest00@gmail.com",
      "testpw0000",
      "EL_001",
      "YIU"
    );
    let channel = channelsCreateV1(data.authUserId, 'dongo', true);
    let list = channelsListV1(data.authUserId);
    expect(typeof channel === "object").toBe(true);
    expect("channelId" in channel).toBe(true);
    expect(typeof channel.channelId === "number").toBe(true);
    expect(typeof list.channels[0] === "object").toBe(true);
    expect("channelId" in list.channels[0]).toBe(true);
    expect("name" in list.channels[0]).toBe(true);
    expect(typeof list.channels[0].channelId === "number").toBe(true);
    expect(list.channels[0].channelId === channel)
    expect(typeof list.channels[0].name === "string").toBe(true);
    expect(list.channels[0].name === name).toBe(true);
  });
});



// (async () => {
//   const process = require("process");
//   const other = await import(process.cwd() + "/src/other.js");
//   const auth = await import(process.cwd() + "/src/auth.js");
//   const channels = await import(process.cwd() + "/src/channels.js");

//   const assert = function (condition, message) {
//     if (!condition) {
//       throw Error("Assert failed");
//     }
//   };

//   const testClear = () => {
//     auth.authRegisterV1("email@email.com", "password", "first", "last");
//     other.clearV1();
//     auth.authRegisterV1("email@email.com", "password", "first", "last");
//     other.clearV1();
//   };

//   const testAuthRegister = () => {
//     other.clearV1();
//     const data = auth.authRegisterV1(
//       "email@email.com",
//       "password",
//       "first",
//       "last"
//     );
//     assert(
//       typeof data === "object" &&
//         "authUserId" in data &&
//         typeof data.authUserId === "number"
//     );
//   };

//   const testChannelsCreate = () => {
//     other.clearV1();
//     const authUserId = auth.authRegisterV1(
//       "email@email.com",
//       "password",
//       "first",
//       "last"
//     ).authUserId;
//     const data = channels.channelsCreateV1(authUserId, "channel_name", true);
//     assert(
//       typeof data === "object" &&
//         "channelId" in data &&
//         typeof data.channelId === "number"
//     );
//   };

//   const testChannelsList = () => {
//     const name = "channel_name";
//     other.clearV1();
//     const authUserId = auth.authRegisterV1(
//       "email@email.com",
//       "password",
//       "first",
//       "last"
//     ).authUserId;
//     const channelId = channels.channelsCreateV1(
//       authUserId,
//       "channel_name",
//       true
//     ).channelId;
//     const data = channels.channelsListV1(authUserId);
//     assert(
//       typeof data === "object" &&
//         "channels" in data &&
//         data.channels.length === 1
//     );
//     assert(
//       typeof data.channels[0] === "object" &&
//         "channelId" in data.channels[0] &&
//         "name" in data.channels[0]
//     );
//     assert(
//       typeof data.channels[0].channelId === "number" &&
//         data.channels[0].channelId === channelId
//     );
//     assert(
//       typeof data.channels[0].name === "string" &&
//         data.channels[0].name === name
//     );
//   };

//   if (require.main === module) {
//     const tests = [
//       testClear,
//       testAuthRegister,
//       testChannelsCreate,
//       testChannelsList,
//     ];
//     let failed = 0;
//     for (let i = 0; i < tests.length; i++) {
//       try {
//         tests[i]();
//       } catch (err) {
//         failed++;
//       }
//     }
//     console.log(
//       `You passed ${tests.length - failed} out of ${tests.length} tests.`
//     );
//   }
// })();
