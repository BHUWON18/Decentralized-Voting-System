-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Completed', 'Ongoing', 'Upcomming');

-- CreateTable
CREATE TABLE "Voter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Voter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "partyName" TEXT NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Elections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TEXT NOT NULL DEFAULT '00:00',
    "endTime" TEXT NOT NULL DEFAULT '23:59',
    "status" "Status" NOT NULL DEFAULT 'Ongoing',

    CONSTRAINT "Elections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voter_email_key" ON "Voter"("email");
