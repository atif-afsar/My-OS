# MyOS - Database Design

Version: 1.0

---

# Purpose

This document defines the database architecture for MyOS.

All database models, relationships, naming conventions, and future scalability should follow this document.

Database technology:

- PostgreSQL (Supabase)
- Prisma ORM

The database should be normalized, scalable, and optimized for a single-user application.

---

# General Rules

- Every table must have a UUID primary key.
- Every table must contain createdAt and updatedAt timestamps.
- Soft delete is not required for MVP.
- Use foreign keys where appropriate.
- Avoid duplicated data.
- Store timestamps in UTC.

---

# User

Purpose

Stores the application owner.

Fields

id

name

email

avatar

createdAt

updatedAt

Relationships

One user has many tasks.

One user has many notes.

One user has many workouts.

One user has many learning resources.

---

# Task

Purpose

Stores work and personal tasks.

Fields

id

title

description

status

priority

dueDate

category

completed

createdAt

updatedAt

Relationships

Belongs to User

Optional Timeline Event

Categories

Work

Learning

Teaching

Gym

Mind

General

Status

Todo

In Progress

Completed

Cancelled

Priority

Low

Medium

High

Urgent

---

# Project

Purpose

Groups multiple tasks.

Fields

id

title

description

status

startDate

endDate

createdAt

updatedAt

Relationships

One project contains many tasks.

---

# Student

Purpose

Manage tuition students.

Fields

id

name

class

school

parentName

phone

notes

createdAt

updatedAt

Relationships

One student has many lesson records.

---

# Lesson

Purpose

Track tuition sessions.

Fields

id

studentId

topic

homework

remarks

date

createdAt

updatedAt

Relationships

Belongs to Student.

---

# Workout

Purpose

Stores gym history.

Fields

id

exercise

sets

reps

weight

duration

notes

date

createdAt

updatedAt

---

# Learning Topic

Purpose

Organize learning subjects.

Fields

id

title

category

description

progress

status

createdAt

updatedAt

Categories

AI

Programming

Business

Marketing

Design

Books

---

# Learning Note

Purpose

Knowledge collected while learning.

Fields

id

topicId

title

content

tags

attachments

createdAt

updatedAt

Relationships

Belongs to Learning Topic.

---

# Bookmark

Purpose

Useful resources.

Fields

id

title

url

category

description

createdAt

updatedAt

Categories

YouTube

Website

GitHub

Article

Book

Course

Documentation

---

# Knowledge

Purpose

Personal second brain.

Fields

id

title

content

category

favorite

createdAt

updatedAt

Categories

Philosophy

Ideas

Quotes

Islamic Notes

Book Notes

Reflection

Psychology

Business

---

# Timeline Event

Purpose

Stores all activity.

Every important action should automatically generate a timeline event.

Fields

id

type

title

description

referenceId

referenceType

createdAt

Examples

Created Task

Completed Workout

Added Note

Finished Lecture

Completed Project

Saved Quote

---

# Settings

Purpose

Application preferences.

Fields

id

theme

accentColor

language

notifications

createdAt

updatedAt

---

# Future Tables

Do NOT implement in MVP.

Voice Notes

AI Chats

Calendar Events

Google Integrations

GitHub Activity

Email

Knowledge Graph

Offline Cache

Notification Queue

---

# Relationships

User

↓

Projects

↓

Tasks

↓

Timeline

User

↓

Learning Topics

↓

Learning Notes

↓

Bookmarks

↓

Timeline

User

↓

Students

↓

Lessons

↓

Timeline

User

↓

Workouts

↓

Timeline

User

↓

Knowledge

↓

Timeline

---

# Indexing

Create indexes for

email

status

category

createdAt

dueDate

title

Search performance is important.

---

# Naming Convention

Tables

Singular

Example

Task

Student

Workout

Knowledge

Columns

camelCase

Primary Key

id

Foreign Keys

taskId

studentId

projectId

topicId

---

# Data Validation

Task title required.

Student name required.

Workout exercise required.

Learning topic title required.

Bookmark URL required.

Knowledge title required.

---

# Security

Authentication required.

Every query must respect the authenticated user.

No public database access.

Use Row Level Security (RLS) in Supabase.

---

# Migration Rules

Never edit existing migrations.

Always create new migrations.

Keep schema synchronized with Prisma.

---

# Future AI Integration

The database should support future AI capabilities without redesign.

Future features include

Semantic Search

Embeddings

Voice Notes

AI Summaries

Knowledge Retrieval

Natural Language Search

These should be implemented as separate tables or services without changing the core schema.

---

# MVP Database Checklist

User

Task

Project

Student

Lesson

Workout

Learning Topic

Learning Note

Bookmark

Knowledge

Timeline Event

Settings

Only these models should exist in Version 1.