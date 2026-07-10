# MyOS - Component Guidelines

Version: 1.0

---

# Purpose

This document defines every reusable component inside MyOS.

The goal is to maintain consistency across the application.

Whenever a new screen is created, reusable components should always be preferred over creating new UI.

Components should be composable, reusable, lightweight, and mobile-first.

---

# Component Philosophy

Every component should

- Have a single responsibility
- Be reusable
- Accept props
- Avoid business logic
- Be easy to understand
- Be accessible
- Follow the Design System

Never duplicate UI.

If similar UI already exists,
reuse it.

---

# Folder Structure

components/

ui/

layout/

navigation/

cards/

forms/

feedback/

common/

icons/

---

# Layout Components

## AppShell

Purpose

Main application wrapper.

Responsibilities

- Safe Area support
- Mobile Layout
- Background
- Navigation placement
- Theme handling

Children

TopBar

BottomNavigation

FloatingActionButton

Page Content

Used on every authenticated screen.

---

## TopBar

Purpose

Application Header

Contains

Page Title

Greeting

Search Button

Profile Avatar

Optional Back Button

Height

64px

Fixed

Reusable

---

## BottomNavigation

Purpose

Primary navigation.

Items

Home

Learning

Quick Add

Timeline

More

Maximum

5 tabs

Always fixed.

Supports active states.

---

## FloatingActionButton

Purpose

Global Quick Capture

Always visible.

Bottom Center.

Actions

Task

Idea

Note

Bookmark

Workout

Learning

Voice (Future)

---

# Navigation Components

## NavigationItem

Displays

Icon

Label

Active State

Badge (optional)

---

## MoreMenu

Displays

Work

Teaching

Gym

Mind

Settings

Profile

Logout

---

# Common Components

## PageHeader

Contains

Title

Description

Optional Action Button

Reusable across all pages.

---

## SectionHeader

Contains

Section Title

Optional Button

Optional Badge

Example

Today's Tasks

See All

---

## EmptyState

Displays

Illustration

Title

Description

Primary Action

Every screen must have an Empty State.

---

## LoadingSkeleton

Purpose

Loading Placeholder

Avoid spinners whenever possible.

---

## SearchBar

Reusable.

Supports

Search

Clear

Keyboard Shortcut (Desktop)

Filters (Future)

---

# Card Components

Cards are the primary UI pattern.

All cards should have

Rounded corners

Border

Padding

Minimal shadow

Touch friendly

---

## TaskCard

Displays

Title

Status

Priority

Due Date

Category

Completion

Actions

Edit

Complete

Delete

---

## ProjectCard

Displays

Project Name

Progress

Task Count

Deadline

Status

---

## LearningCard

Displays

Topic

Progress

Category

Recent Activity

Continue Button

---

## WorkoutCard

Displays

Workout

Exercise Count

Duration

Progress

---

## StudentCard

Displays

Student Name

Class

Upcoming Lesson

Attendance

---

## KnowledgeCard

Displays

Title

Category

Tags

Favorite

Created Date

---

## TimelineCard

Displays

Activity Icon

Title

Description

Time

Category

---

## BookmarkCard

Displays

Title

Website

Category

Open Button

Favorite

---

# Form Components

## TextInput

Supports

Label

Placeholder

Helper Text

Validation

Error

---

## TextArea

Supports

Markdown (Future)

Auto Resize

Character Count

---

## Select

Reusable Dropdown

---

## Checkbox

Reusable

---

## Switch

Reusable

---

## DatePicker

Reusable

---

## FileUploader

Supports

Image

PDF

Documents

Future

Drag & Drop

---

# Feedback Components

## Toast

Success

Warning

Error

Info

---

## ConfirmationDialog

Used only for

Delete

Logout

Reset

Never overuse dialogs.

---

## BottomSheet

Preferred over dialogs.

Used for

Quick Add

Filters

Actions

Mobile first.

---

# Dashboard Components

Dashboard should be assembled from reusable widgets.

Widgets

GreetingCard

Today'sFocus

QuickActions

ProgressCard

UpcomingCard

RecentActivity

DailySummary

Each widget should be independent.

---

# Work Components

Task List

Task Card

Project Card

Meeting Card

Daily Log Card

---

# Teaching Components

Student Card

Lesson Card

Homework Card

Attendance Card

---

# Learning Components

Learning Card

Resource Card

Lecture Card

Progress Card

Bookmark Card

---

# Gym Components

Workout Card

Exercise Card

Progress Card

History Card

---

# Mind Components

Knowledge Card

Quote Card

Idea Card

Book Card

Reflection Card

---

# Timeline Components

Timeline Card

Timeline Group

Date Divider

Activity Icon

---

# Animation Rules

Every interactive component should support

Hover (Desktop)

Pressed State

Loading State

Disabled State

Focus State

Animation duration

150ms–250ms

Never animate excessively.

---

# Component Naming

PascalCase

Examples

TaskCard

WorkoutCard

PageHeader

BottomNavigation

FloatingActionButton

Never abbreviate component names.

---

# Props

Components should receive data through props.

Avoid fetching data directly inside components.

Example

TaskCard

Props

task

onComplete

onEdit

onDelete

---

# Reusability Rules

Before creating a component ask

Can an existing component be reused?

Can this become generic?

Will another feature use this?

If yes,

extract it.

---

# Accessibility

Every component must

Support keyboard navigation

Have accessible labels

Support screen readers

Maintain proper contrast

Have touch targets larger than 44px

---

# Mobile Rules

Components should

Support one-hand usage

Avoid tiny buttons

Avoid horizontal scrolling

Look good on 360px width devices

---

# Future Components

Voice Recorder

AI Chat

Calendar Widget

Knowledge Graph

Analytics Card

Streak Card

Goal Card

Do not implement until roadmap reaches those phases.

---

# Component Golden Rule

Components should never know

Where data comes from.

How data is stored.

How APIs work.

A component should only know

How to display information.

Business logic belongs inside Features.

Data belongs inside Services.

UI belongs inside Components.