```javascript
const data = {
  users: [
    {
      authUserId: 3,
      email: "something@hmail.com",
      password: "Ilovedogs",
      nameFirst: "Bongo",
      nameLast: "Dongo",
      handleStr: "bongodongo",
      isGlobalOwner: 1,
    },
    {
      authUserId: 8,
      email: "radu@gmail.com",
      password: "ILoveCats",
      nameFirst: "Trungo",
      nameLast: "Bonogo",
      handleStr: "trungobonogo",
      isGlobalOwner: 2,
    },
  ],

  channels: [
    {
      channelId: 1,
      name: "Bongo Server",
      isPublic: true,
      ownerMembers: [
        {
          uId: 3,
          email: "something@hmail.com",
          nameFirst: "Bongo",
          nameLast: "Dongo",
          handleStr: "bongodongo",
        },
      ],
      allMembers: [
        {
          uId: 3,
          email: "something@hmail.com",
          nameFirst: "Bongo",
          nameLast: "Dongo",
          handleStr: "bongodongo",
        },
      ],
      messages: [
        {
          messageId: 2048,
          uId: 3,
          message: "Bongo Dog",
          timeSent: 1582426789,
        },
      ],
      start: 0,
      end: 50,
    },
    {
      channelId: 2,
      name: "Dongo's Server",
      isPublic: false,
      ownerMembers: [
        {
          uId: 3,
          email: "something@hmail.com",
          nameFirst: "Bongo",
          nameLast: "Dongo",
          handleStr: "bongodongo",
        },
      ],
      allMembers: [
        {
          uId: 3,
          email: "something@hmail.com",
          nameFirst: "Bongo",
          nameLast: "Dongo",
          handleStr: "bongodongo",
        },
        {
          uId: 8,
          email: "radu@gmail.com",
          nameFirst: "Trungo",
          nameLast: "Bonogo",
          handleStr: "trungobonogo",
        },
      ],
      messages: [
        {
          messageId: 2048,
          uId: 34,
          message: "Bongo Dog",
          timeSent: 1582426789,
        },
      ],
      start: 0,
      end: 50,
    },
  ],
};
```

[Optional] short description:

The information in data.md is used to store data according to user data or channel data. Updated for iteration 1
