# MyOS - Product Requirements Document (PRD)

Version: 1.0
Status: Planning
Author: Atif Afsar

---

# 1. Vision

MyOS is a personal operating system designed specifically around my daily life.

This is NOT a productivity application like Notion, Todoist, or ClickUp.

This is my own digital operating system where every important aspect of my daily routine lives in one place.

The application should reduce distractions, reduce context switching, and become the only application I need to organize my life.

The entire experience should feel intentional, minimal, fast, and personal.

The primary goal is not productivity.

The primary goal is clarity.

Every screen should answer one question:

> What should I be doing right now?

---

# 2. Product Philosophy

MyOS should never become feature-heavy.

Every feature must solve a real problem that I personally experience.

If a feature does not improve my daily workflow, it should not be added.

The application should feel like Apple Notes meets Linear meets Raycast, designed specifically for my own life.

Core principles:

- Minimal
- Fast
- Mobile-first
- Offline-friendly (future)
- Beautiful
- Distraction-free
- Keyboard friendly (desktop)
- Thumb friendly (mobile)

---

# 3. Target Platform

Primary Platform:

Mobile (Android)

Approximately 98% of usage will happen on a mobile phone.

Desktop support is secondary.

The application should be built as a Progressive Web App (PWA).

It should feel like a native application when installed.

No Play Store deployment is required initially.

---

# 4. Primary User

Single User

No multi-user support.

No collaboration.

No team management.

Everything is optimized around my own workflow.

---

# 5. Core Life Areas

Everything inside the application belongs to one of these five categories.

## Work

Office work

Client projects

Development tasks

Ideas

Meeting notes

Daily work log

---

## Teaching

Students

Lesson planning

Homework

Attendance

Topics

Teaching notes

---

## Learning

Artificial Intelligence

Programming

Web Development

Business

Marketing

Books

Courses

Lectures

Bookmarks

Learning notes

---

## Gym

Workout plans

Exercises

Workout history

Progress

---

## Mind

Philosophy

Quotes

Ideas

Islamic Notes

Book Notes

Personal Reflections

Life Lessons

---

# 6. MVP Goal

The MVP should become the first application I open every morning and the last application I close every night.

If I successfully use MyOS every day for one month, the MVP is successful.

---

# 7. MVP Features

## Dashboard

The Dashboard is the home screen.

It should immediately tell me:

Current Focus

Today's Schedule

Upcoming Activity

Recent Activity

Today's Progress

Quick Add

The dashboard should never become cluttered.

---

## Work Module

Purpose:

Manage office work.

Features

Projects

Tasks

Meeting Notes

Ideas

Daily Log

Task Status

Todo

In Progress

Completed

---

## Teaching Module

Purpose

Manage tuition.

Features

Students

Class Notes

Today's Topic

Homework

Attendance

Lesson Plans

---

## Learning Module

Purpose

Everything I learn should live here.

Categories

AI

Programming

Marketing

Business

Books

Design

Each learning topic supports

Notes

Bookmarks

Lecture Progress

Resources

PDFs

Useful Links

---

## Gym Module

Purpose

Track workouts.

Features

Workout Plan

Exercises

Sets

Reps

Workout History

Personal Records

---

## Mind Module

Purpose

Store personal knowledge.

Collections

Philosophy

Ideas

Quotes

Book Notes

Islamic Notes

Personal Reflections

Markdown supported.

---

# 8. Universal Features

These features work everywhere.

Quick Capture

Global Search

Timeline

Tags

Favorites

Markdown Notes

Attachments

Dark Mode

---

# 9. Quick Capture

This is one of the most important features.

It should be possible to save anything within five seconds.

Supported items

Task

Idea

Quick Note

Quote

Bookmark

Learning Resource

Voice Note (Future)

The Quick Capture button should always be accessible.

---

# 10. Timeline

Everything I do creates a timeline event.

Examples

Completed Workout

Created Note

Finished Lecture

Added Task

Completed Task

Saved Quote

This allows me to look back at any day.

---

# 11. Search

Search should search everything.

Tasks

Projects

Notes

Learning

Books

Ideas

Quotes

Students

Resources

No separate searches.

---

# 12. UI Design Principles

Dark mode first

Minimal interface

Large touch targets

Rounded corners

Smooth animations

Minimal colors

No visual clutter

Whitespace should be heavily used.

The application should feel premium.

---

# 13. Mobile UX Principles

Everything should be reachable using one hand.

Bottom navigation only.

No desktop sidebars on mobile.

The most common action should require one tap.

The application should never require more than three taps for common actions.

---

# 14. Navigation

Home

Learning

Quick Add

Timeline

More

The "More" section contains

Work

Teaching

Gym

Mind

Settings

---

# 15. Technical Stack

Framework

Next.js 15

Language

TypeScript

Styling

Tailwind CSS

UI

shadcn/ui

Animations

Framer Motion

Database

Supabase PostgreSQL

Authentication

Supabase Auth

ORM

Prisma

Forms

React Hook Form

Validation

Zod

State Management

Zustand

Deployment

Vercel

Application Type

Progressive Web App

---

# 16. Folder Structure

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

# 17. Design Inspiration

Linear

Raycast

Apple

Arc Browser

Notion

The goal is not to copy these products.

The goal is to capture their simplicity.

---

# 18. Future Roadmap

Phase 2

Voice Notes

Speech To Text

Smart Search

AI Summaries

Auto Tagging

---

Phase 3

AI Assistant

Natural Language Search

Ask My Notes

Daily Summary

Tomorrow Planning

Learning Suggestions

---

Phase 4

Voice Assistant

Wake Word

Hands-free Commands

Task Creation

Daily Briefing

Navigation

---

Phase 5

Calendar Sync

Google Calendar

Meeting Import

Automatic Schedule

---

Phase 6

Knowledge Graph

Relationships

Topic Linking

Connected Notes

Knowledge Visualization

---

Phase 7

Native Android Application

Offline Sync

Widgets

Push Notifications

---

# 19. Things MyOS Should Never Become

A social network.

A team collaboration tool.

A CRM.

A finance application.

A calorie tracker.

A complicated project management system.

A feature-heavy productivity app.

Every feature should support my own life.

Nothing else.

---

# 20. Success Criteria

I should be able to

Open the app every morning.

Know exactly what to do next.

Capture any idea in under five seconds.

Find any note within seconds.

Track my learning.

Manage my work.

Manage teaching.

Track workouts.

Store knowledge.

Never feel the need to switch between multiple applications.

---

# 21. Guiding Principle

When making design or engineering decisions, always choose:

Simple over complex.

Fast over fancy.

Useful over impressive.

Minimal over feature-rich.

Personal over generic.

If there is uncertainty, ask:

"Does this improve my daily life?"

If the answer is no, it should not be implemented.