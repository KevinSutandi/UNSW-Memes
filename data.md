```javascript
const data = {
  users: [
    {
      uId: 34,
      authUserId: 3,
      email: "something@hmail.com",
      password: "Ilovedogs",
      nameFirst: "Bongo",
      nameLast: "Dongo",
      handleStr: "bongodongo302",
      isGlobalOwner: true,
    },
    {
      uId: 69,
      authUserId: 8,
      email: "radu@gmail.com",
      password: "ILoveCats",
      nameFirst: "Trungo",
      nameLast: "Bonogo",
      handleStr: "bongodongo302",
      globalPermission: 2,
      isGlobalOwner: false,
    },
  ],

  channels: [
    {
      channelId: 1,
      name: "Bongo Server",
      isPublic: true,
      ownerMembers: [
        {
          uId: 34,
          email: "something@hmail.com",
          nameFirst: "Bongo",
          nameLast: "Dongo",
          handleStr: "bongodongo302",
        },
      ],
      allMembers: [
        {
          uId: 34,
          email: "something@hmail.com",
          nameFirst: "Bongo",
          nameLast: "Dongo",
          handleStr: "bongodongo302",
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
    {
      channelId: 2,
      name: "Dongo's Server",
      isPublic: false,
      ownerMembers: [
        {
          uId: 34,
          email: "something@hmail.com",
          nameFirst: "Bongo",
          nameLast: "Dongo",
          handleStr: "bongodongo302",
        },
      ],
      allMembers: [
        {
          uId: 34,
          email: "something@hmail.com",
          nameFirst: "Bongo",
          nameLast: "Dongo",
          handleStr: "bongodongo302",
        },
        {
          uId: 12,
          email: "kevin@hmail.com",
          nameFirst: "kevin",
          nameLast: "sut",
          handleStr: "lmao233",
        },
        {
          uId: 24,
          email: "24@hmail.com",
          nameFirst: "24",
          nameLast: "24",
          handleStr: "24",
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

The information in data.md is used to store data according to user data or channel data (Not complete version just yet)
