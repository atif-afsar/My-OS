# MyOS - Architecture Documentation

Version: 1.0

---

# Purpose

This document defines the technical architecture of MyOS.

The AI should always follow this architecture when generating code.

Maintain consistency throughout the project.

Do not introduce unnecessary patterns or libraries.

---

# Architecture Principles

MyOS follows these principles:

- Feature-first architecture
- Component-driven development
- Mobile-first UI
- Server Components by default
- Client Components only when necessary
- Clean separation of concerns
- Reusable UI
- Scalable structure
- Easy maintenance

---

# Technology Stack

Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

Backend

- Next.js Route Handlers

Database

- Supabase PostgreSQL

Authentication

- Supabase Auth

ORM

- Prisma

State Management

- Zustand

Forms

- React Hook Form

Validation

- Zod

Deployment

- Vercel

Application Type

- Progressive Web App (PWA)

---

# Folder Structure

app/
components/
features/
hooks/
lib/
services/
stores/
types/
utils/
constants/
styles/
public/
docs/

---

# App Folder

Responsible for routing.

Example

app/

layout.tsx

page.tsx

work/

learning/

gym/

mind/

timeline/

settings/

Each page should contain minimal logic.

Heavy logic belongs inside features.

---

# Features Folder

Every business feature lives here.

Example

features/

dashboard/

work/

learning/

gym/

teaching/

mind/

timeline/

Each feature should contain

components/

hooks/

services/

types/

utils/

Example

features/work/

components/

hooks/

services/

types/

utils/

---

# Components Folder

Contains shared components.

Example

components/

ui/

layout/

navigation/

cards/

common/

Components here must be reusable.

Business logic should never exist here.

---

# Services

Responsible for data access.

Examples

Task Service

Learning Service

Gym Service

Student Service

Timeline Service

Never fetch data directly inside UI components.

---

# Hooks

Reusable custom hooks.

Examples

useTasks()

useLearning()

useWorkouts()

useTimeline()

useSearch()

---

# Stores

Global Zustand stores.

Examples

theme.store.ts

user.store.ts

navigation.store.ts

settings.store.ts

Keep stores lightweight.

Avoid storing server data globally.

---

# Utils

Pure utility functions.

Examples

Date formatting

Time formatting

String helpers

Validators

Color helpers

No React code here.

---

# Constants

Application constants.

Examples

Navigation

Colors

Categories

Status Types

Routes

Icons

---

# Types

Shared TypeScript types.

Example

Task

Project

Workout

Student

LearningNote

TimelineEvent

KnowledgeItem

---

# Data Flow

User

↓

Page

↓

Feature

↓

Service

↓

Database

The UI should never communicate directly with the database.

---

# State Management

Use Zustand only for

Theme

Navigation

User Preferences

Current Session

Avoid using Zustand for server data.

Use React state where possible.

---

# API Layer

All API logic should exist inside

app/api/

Example

api/tasks

api/work

api/learning

api/gym

api/students

api/search

Never call Supabase directly from UI unless appropriate for authenticated client operations.

---

# Naming Conventions

Components

PascalCase

TaskCard.tsx

WorkoutCard.tsx

Hooks

camelCase

useTasks.ts

Services

camelCase

task.service.ts

Stores

feature.store.ts

Types

PascalCase

Task.ts

---

# Styling Rules

Use Tailwind CSS only.

Do not create custom CSS files unless absolutely necessary.

Use design tokens.

Avoid inline styles.

Avoid hardcoded colors.

---

# Component Rules

Each component should

Have one responsibility

Be reusable

Remain small

Be easy to test

Receive data via props

Avoid unnecessary state

---

# Error Handling

Every async operation should

Handle loading state

Handle error state

Handle empty state

Never silently fail.

---

# Performance Rules

Lazy load heavy pages.

Use dynamic imports when appropriate.

Avoid unnecessary client components.

Optimize images.

Minimize re-renders.

---

# Mobile First Rules

Every screen must be designed for mobile first.

Touch targets should be at least 44px.

Bottom navigation is primary.

One-handed usage should be possible.

Avoid horizontal scrolling.

---

# Accessibility

Buttons should have labels.

Icons should have accessible names.

Support keyboard navigation.

Maintain sufficient color contrast.

---

# Future Architecture

Future integrations

Voice Assistant

AI Assistant

Google Calendar

Knowledge Graph

Offline Sync

Native Android App

These should be implemented as independent modules without affecting the core architecture.

---

# Guiding Rule

Whenever implementing a new feature, ask:

Can this feature be isolated?

Can it be reused?

Can it scale?

If the answer is no, redesign before implementation.