-- CreateTable
CREATE TABLE "channelsJoined" (
    "id" SERIAL NOT NULL,
    "timeStamp" INTEGER NOT NULL,
    "numChannelsJoined" INTEGER NOT NULL,
    "userStatsId" INTEGER,

    CONSTRAINT "channelsJoined_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dmsJoined" (
    "id" SERIAL NOT NULL,
    "timeStamp" INTEGER NOT NULL,
    "numDmsJoined" INTEGER NOT NULL,
    "userStatsId" INTEGER,

    CONSTRAINT "dmsJoined_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messagesSent" (
    "id" SERIAL NOT NULL,
    "timeStamp" INTEGER NOT NULL,
    "numMessagesSent" INTEGER NOT NULL,
    "userStatsId" INTEGER,

    CONSTRAINT "messagesSent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usersId" INTEGER,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL DEFAULT -1,
    "dmId" INTEGER NOT NULL DEFAULT -1,
    "notificationMessage" TEXT NOT NULL,
    "usersId" INTEGER,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userStats" (
    "id" SERIAL NOT NULL,
    "involvementRate" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "userStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "authUserId" INTEGER NOT NULL,
    "handleStr" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nameFirst" TEXT NOT NULL DEFAULT '',
    "nameLast" TEXT NOT NULL DEFAULT '',
    "isGlobalowner" INTEGER NOT NULL DEFAULT 2,
    "profileImgUrl" TEXT NOT NULL DEFAULT '',
    "userStatsId" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standUp" (
    "id" SERIAL NOT NULL,
    "standUpActive" BOOLEAN NOT NULL DEFAULT false,
    "standUpLength" INTEGER NOT NULL DEFAULT 0,
    "standUpMessage" JSONB NOT NULL,
    "StandUpOwner" INTEGER NOT NULL DEFAULT -1,

    CONSTRAINT "standUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ownerMembers" (
    "id" SERIAL NOT NULL,
    "uId" INTEGER NOT NULL,
    "handleStr" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nameFirst" TEXT NOT NULL,
    "nameLast" TEXT NOT NULL,
    "profileImgUrl" TEXT NOT NULL,
    "channelsId" INTEGER NOT NULL,
    "dmId" INTEGER NOT NULL,

    CONSTRAINT "ownerMembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allMembers" (
    "id" SERIAL NOT NULL,
    "uId" INTEGER NOT NULL,
    "handleStr" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nameFirst" TEXT NOT NULL,
    "nameLast" TEXT NOT NULL,
    "profileImgUrl" TEXT NOT NULL,
    "channelsId" INTEGER NOT NULL,
    "dmId" INTEGER NOT NULL,

    CONSTRAINT "allMembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactsObject" (
    "id" SERIAL NOT NULL,
    "reactId" INTEGER NOT NULL,
    "uIds" INTEGER[],
    "isThisUserReacted" BOOLEAN NOT NULL,
    "messagesId" INTEGER,

    CONSTRAINT "reactsObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "uId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "timeSent" INTEGER NOT NULL,
    "isPinned" BOOLEAN NOT NULL,
    "channelsId" INTEGER,
    "dmId" INTEGER,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "standUpId" INTEGER NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dm" (
    "id" SERIAL NOT NULL,
    "dmId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,

    CONSTRAINT "dm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channelsExist" (
    "id" SERIAL NOT NULL,
    "timeStamp" INTEGER NOT NULL,
    "numChannelsExist" INTEGER NOT NULL,
    "statsId" INTEGER,

    CONSTRAINT "channelsExist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dmsExist" (
    "id" SERIAL NOT NULL,
    "timeStamp" INTEGER NOT NULL,
    "numDmsExist" INTEGER NOT NULL,
    "statsId" INTEGER,

    CONSTRAINT "dmsExist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messagesExist" (
    "id" SERIAL NOT NULL,
    "timeStamp" INTEGER NOT NULL,
    "numMessagesExist" INTEGER NOT NULL,
    "statsId" INTEGER,

    CONSTRAINT "messagesExist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stats" (
    "id" SERIAL NOT NULL,
    "utilizationRate" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resetCodes" (
    "id" SERIAL NOT NULL,
    "authUserId" INTEGER NOT NULL,
    "resetCode" TEXT NOT NULL,

    CONSTRAINT "resetCodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_token_key" ON "token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_authUserId_key" ON "users"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_handleStr_key" ON "users"("handleStr");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ownerMembers_uId_key" ON "ownerMembers"("uId");

-- CreateIndex
CREATE UNIQUE INDEX "ownerMembers_handleStr_key" ON "ownerMembers"("handleStr");

-- CreateIndex
CREATE UNIQUE INDEX "ownerMembers_email_key" ON "ownerMembers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "allMembers_uId_key" ON "allMembers"("uId");

-- CreateIndex
CREATE UNIQUE INDEX "allMembers_handleStr_key" ON "allMembers"("handleStr");

-- CreateIndex
CREATE UNIQUE INDEX "allMembers_email_key" ON "allMembers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reactsObject_reactId_key" ON "reactsObject"("reactId");

-- CreateIndex
CREATE UNIQUE INDEX "reactsObject_uIds_key" ON "reactsObject"("uIds");

-- CreateIndex
CREATE UNIQUE INDEX "messages_messageId_key" ON "messages"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "messages_uId_key" ON "messages"("uId");

-- CreateIndex
CREATE UNIQUE INDEX "channels_channelId_key" ON "channels"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "dm_dmId_key" ON "dm"("dmId");

-- CreateIndex
CREATE UNIQUE INDEX "resetCodes_authUserId_key" ON "resetCodes"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "resetCodes_resetCode_key" ON "resetCodes"("resetCode");

-- AddForeignKey
ALTER TABLE "channelsJoined" ADD CONSTRAINT "channelsJoined_userStatsId_fkey" FOREIGN KEY ("userStatsId") REFERENCES "userStats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dmsJoined" ADD CONSTRAINT "dmsJoined_userStatsId_fkey" FOREIGN KEY ("userStatsId") REFERENCES "userStats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messagesSent" ADD CONSTRAINT "messagesSent_userStatsId_fkey" FOREIGN KEY ("userStatsId") REFERENCES "userStats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userStatsId_fkey" FOREIGN KEY ("userStatsId") REFERENCES "userStats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownerMembers" ADD CONSTRAINT "ownerMembers_channelsId_fkey" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownerMembers" ADD CONSTRAINT "ownerMembers_dmId_fkey" FOREIGN KEY ("dmId") REFERENCES "dm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allMembers" ADD CONSTRAINT "allMembers_channelsId_fkey" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allMembers" ADD CONSTRAINT "allMembers_dmId_fkey" FOREIGN KEY ("dmId") REFERENCES "dm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactsObject" ADD CONSTRAINT "reactsObject_messagesId_fkey" FOREIGN KEY ("messagesId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_channelsId_fkey" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_dmId_fkey" FOREIGN KEY ("dmId") REFERENCES "dm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_standUpId_fkey" FOREIGN KEY ("standUpId") REFERENCES "standUp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channelsExist" ADD CONSTRAINT "channelsExist_statsId_fkey" FOREIGN KEY ("statsId") REFERENCES "stats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dmsExist" ADD CONSTRAINT "dmsExist_statsId_fkey" FOREIGN KEY ("statsId") REFERENCES "stats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messagesExist" ADD CONSTRAINT "messagesExist_statsId_fkey" FOREIGN KEY ("statsId") REFERENCES "stats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
