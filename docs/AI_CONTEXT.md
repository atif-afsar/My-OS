# MyOS - AI Context

Version: 1.0

---

# Purpose

This document defines how AI assistants (Antigravity, Cursor, Gemini, Claude, etc.) should behave while working on MyOS.

Before writing any code, always read:

- PRD.md
- ROADMAP.md
- ARCHITECTURE.md
- DATABASE.md
- DESIGN_SYSTEM.md
- DEVELOPMENT_RULES.md
- COMPONENT_GUIDELINES.md
- UI_UX_FLOW.md
- FEATURE_SPECIFICATIONS.md

This documentation is the source of truth.

Never ignore it.

---

# Project Overview

Project Name

MyOS

Description

A personal operating system built specifically for Atif Afsar.

This is NOT a generic productivity application.

This is a personal life management system focused on simplicity, clarity, and speed.

---

# Core Philosophy

Every feature should answer

"What should I do right now?"

Everything unnecessary should be removed.

Prefer less.

Never add features simply because they are common in other applications.

---

# Development Philosophy

Always think like a Senior Software Engineer.

Write production-ready code.

Never write demo code.

Never use shortcuts.

Never over-engineer.

Always think about scalability.

---

# UI Philosophy

The interface should feel like

Apple

Linear

Raycast

Arc Browser

Modern Android

Premium

Minimal

Fast

Elegant

Calm

---

# Mobile First

98% of usage is on Android.

Every screen must be optimized for mobile.

Desktop is secondary.

Design for one-handed usage.

---

# Code Quality

Always write

Clean

Reusable

Modular

Typed

Scalable

Readable

Maintainable

code.

---

# Preferred Stack

Next.js 15

TypeScript

Tailwind CSS

shadcn/ui

Framer Motion

Supabase

Prisma

Zustand

React Hook Form

Zod

Vercel

Avoid introducing additional libraries unless necessary.

---

# Before Creating Code

Always ask

Can an existing component be reused?

Can existing logic be extended?

Does this follow the architecture?

Will this improve maintainability?

If not,

refactor before adding.

---

# Before Installing Packages

Always ask

Can this be built using existing libraries?

Will this package reduce complexity?

Is it actively maintained?

Does it increase bundle size?

Prefer fewer dependencies.

---

# Component Rules

Components should

Have one responsibility.

Receive props.

Avoid business logic.

Be reusable.

Be accessible.

Be mobile-first.

---

# Service Rules

Business logic belongs in services.

UI never talks directly to the database.

Pages should remain lightweight.

---

# State Rules

Use local state whenever possible.

Use Zustand only when global state is necessary.

Never store server data unnecessarily.

---

# Performance Rules

Fast loading.

Minimal JavaScript.

Lazy loading.

Skeleton loading.

Optimized images.

Avoid unnecessary re-renders.

---

# UX Rules

Every action should require as few taps as possible.

Quick Capture should always be accessible.

Large touch targets.

Readable typography.

Minimal scrolling.

---

# Design Rules

Dark mode first.

Rounded corners.

Consistent spacing.

Consistent typography.

Soft animations.

Never clutter screens.

Whitespace is important.

---

# AI Decision Rules

If multiple implementations are possible,

choose the one that is

Simpler

Cleaner

More scalable

More maintainable

Avoid clever code.

---

# Feature Rules

Never implement future roadmap features unless explicitly requested.

Current focus is MVP only.

Ignore

AI Assistant

Voice Assistant

Calendar Sync

Knowledge Graph

Analytics

Native App

until later phases.

---

# Error Handling

Every feature should

Handle loading

Handle empty states

Handle errors

Provide user feedback

Never fail silently.

---

# Security

Never expose secrets.

Validate input.

Respect authentication.

Use environment variables.

Follow Supabase RLS.

---

# Documentation Rule

Whenever a major feature is completed,

update

CHANGELOG.md

ROADMAP.md

if necessary.

Documentation should always match the implementation.

---

# Final Rule

Do not try to impress.

Try to build the best personal operating system possible.

Whenever uncertain,

choose simplicity.