-- DropForeignKey
ALTER TABLE "allMembers" DROP CONSTRAINT "allMembers_channelsId_fkey";

-- DropForeignKey
ALTER TABLE "allMembers" DROP CONSTRAINT "allMembers_dmId_fkey";

-- DropForeignKey
ALTER TABLE "ownerMembers" DROP CONSTRAINT "ownerMembers_channelsId_fkey";

-- DropForeignKey
ALTER TABLE "ownerMembers" DROP CONSTRAINT "ownerMembers_dmId_fkey";

-- AlterTable
ALTER TABLE "allMembers" ALTER COLUMN "channelsId" DROP NOT NULL,
ALTER COLUMN "dmId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ownerMembers" ALTER COLUMN "channelsId" DROP NOT NULL,
ALTER COLUMN "dmId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ownerMembers" ADD CONSTRAINT "ownerMembers_channelsId_fkey" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownerMembers" ADD CONSTRAINT "ownerMembers_dmId_fkey" FOREIGN KEY ("dmId") REFERENCES "dm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allMembers" ADD CONSTRAINT "allMembers_channelsId_fkey" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allMembers" ADD CONSTRAINT "allMembers_dmId_fkey" FOREIGN KEY ("dmId") REFERENCES "dm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
