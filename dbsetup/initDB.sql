-- Enable UUID extension
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE public.Users (
    userID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Teachers Table
CREATE TABLE public.Teachers (
    userID UUID PRIMARY KEY REFERENCES public.Users(userID) ON DELETE CASCADE
);

-- Classes Table
CREATE TABLE public.Classes (
    classID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    classSubject VARCHAR(255) NOT NULL,
    classNumber VARCHAR(255) NOT NULL,
    teacherID UUID NULL REFERENCES public.Teachers(userID) ON DELETE SET NULL
);

-- Groups Table
CREATE TABLE public.Groups (
    groupID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    classID UUID NOT NULL REFERENCES public.Classes(classID) ON DELETE CASCADE
);

-- Students Table
CREATE TABLE public.Students (
    userID UUID PRIMARY KEY REFERENCES public.Users(userID) ON DELETE CASCADE,
    groupID UUID NULL REFERENCES public.Groups(groupID) ON DELETE SET NULL
);

-- Question Sets Table
CREATE TABLE public.QuestionSet (
    questionsetID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    createdBy UUID NULL REFERENCES public.Users(userID) ON DELETE SET NULL,
    createTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255) NOT NULL,
    tags TEXT[] DEFAULT '{}'
);

-- Chapters Table
CREATE TABLE public.Chapters (
    chapterID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    classID UUID NULL REFERENCES public.Classes(classID) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

-- Chapter-QuestionSet Relationship Table
CREATE TABLE public.Chapter_QuestionSet (
    chapterID UUID NOT NULL,
    questionsetID UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    PRIMARY KEY (chapterID, questionsetID),
    FOREIGN KEY (chapterID) REFERENCES public.Chapters(chapterID) ON DELETE CASCADE,
    FOREIGN KEY (questionsetID) REFERENCES public.QuestionSet(questionsetID) ON DELETE CASCADE
);


-- Questions Table
CREATE TABLE public.Questions (
    questionID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    questionsetID UUID NULL REFERENCES public.QuestionSet(questionsetID) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    allowLanguage VARCHAR(255) DEFAULT 'cpp',
    testcases JSONB DEFAULT '{}'
);

-- Group Work Table
CREATE TABLE public.GroupWork (
    workID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    groupID UUID NOT NULL REFERENCES public.Groups(groupID) ON DELETE CASCADE,
    questionID UUID NOT NULL REFERENCES public.Questions(questionID) ON DELETE CASCADE,
    submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    code TEXT,
    evaluation JSONB DEFAULT '{}'
);

-- Rooms Table
CREATE TABLE public.Rooms (
    roomID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workID UUID NOT NULL REFERENCES public.GroupWork(workID) ON DELETE CASCADE,
    questionID UUID NOT NULL REFERENCES public.Questions(questionID) ON DELETE CASCADE,
    code JSONB DEFAULT '{}'
);