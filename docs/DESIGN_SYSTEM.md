# MyOS - Design System

Version: 1.0

---

# Purpose

This document defines the visual language of MyOS.

Every screen, component, interaction, spacing, animation, and layout should follow this document.

The goal is to create an interface that feels premium, minimal, modern, and extremely fast.

Design consistency is more important than creativity.

---

# Design Philosophy

MyOS should feel like

- Linear
- Apple
- Arc Browser
- Raycast
- Notion

The design should never feel cluttered.

Everything should breathe.

Whitespace is a feature.

---

# Core Principles

Minimal

Fast

Elegant

Mobile First

Readable

Accessible

Consistent

---

# Target Platform

Primary

Android Mobile

Secondary

Desktop

Every screen should be designed for mobile first.

Desktop layouts should adapt from mobile.

---

# Color System

## Primary

Purple

#5E0ED7

Used for

Primary Buttons

Active Navigation

FAB

Links

Highlights

---

## Background

#09090B

---

## Surface

#18181B

Cards

Dialogs

Bottom Sheets

Containers

---

## Secondary Surface

#27272A

Used for

Borders

Dividers

Secondary Cards

---

## Text Primary

#FFFFFF

---

## Text Secondary

#A1A1AA

---

## Success

#22C55E

---

## Warning

#F59E0B

---

## Error

#EF4444

---

## Border

#27272A

---

# Typography

Font

Geist

Fallback

Inter

---

Heading 1

32px

Bold

---

Heading 2

24px

Bold

---

Heading 3

20px

SemiBold

---

Heading 4

18px

SemiBold

---

Body

16px

Regular

---

Small Text

14px

Regular

---

Caption

12px

Medium

---

# Border Radius

Small

8px

Medium

12px

Large

16px

Extra Large

24px

Cards should generally use

16px

---

# Shadows

Very soft.

Avoid heavy shadows.

Dark UI should rely on elevation using contrast.

---

# Spacing

Use an 8-point grid.

Allowed spacing

4

8

12

16

20

24

32

40

48

64

Never use random spacing.

---

# Icons

Use

Lucide Icons

Icons should be

24px

Stroke Width

2

Never mix icon libraries.

---

# Buttons

Primary Button

Filled Purple

White Text

Rounded XL

Height

48px

---

Secondary Button

Outline

Transparent

Border Only

---

Ghost Button

Transparent

No Border

---

Icon Button

Square

48x48

Rounded Full

---

Floating Action Button

Always Visible

Purple

Circular

56x56

Shadow

Bottom Center

Purpose

Quick Capture

---

# Cards

Cards are the primary container.

Properties

Rounded XL

Soft Border

Small Shadow

Padding 16px

Cards should never touch screen edges.

---

# Inputs

Rounded

Large touch area

Height 48px

Label above input

Error below input

Support helper text.

---

# Bottom Navigation

Always fixed.

Five tabs maximum.

Home

Learning

Quick Add

Timeline

More

Height

72px

Safe Area Supported

---

# App Bar

Fixed

Transparent on scroll

Contains

Greeting

Page Title

Profile

Search

Minimal.

---

# Lists

Spacing

12px

Cards separated.

Avoid dense layouts.

---

# Empty States

Every screen must have an empty state.

Include

Illustration (future)

Title

Description

Primary Action

Never leave blank screens.

---

# Loading States

Use Skeleton Loaders.

Avoid spinners whenever possible.

---

# Animations

Use Framer Motion.

Animations should be subtle.

Duration

150ms - 250ms

Examples

Fade

Slide

Scale

Never use

Bounce

Flip

Rotate

Excessive motion

---

# Page Transition

Smooth Fade

Small Slide

Maximum

250ms

---

# Bottom Sheet

Preferred over Modal.

Mobile first.

Rounded Top

Blur Background

Dismiss by swipe.

---

# Dialog

Only for important confirmations.

Delete

Logout

Reset

Never overuse dialogs.

---

# Feedback

Every action should provide feedback.

Examples

Toast

Snack Bar

Button Loading

Success Animation

---

# Accessibility

Minimum touch size

44px

Readable text

High contrast

Accessible labels

Keyboard support (desktop)

---

# Layout Rules

Maximum content width

768px

Centered on Desktop

Full Width on Mobile

Padding

16px

Safe Area

Supported

---

# Responsive Rules

Mobile

Default

Tablet

Adaptive

Desktop

Centered Layout

Do not build desktop-first.

---

# Component Guidelines

Components should

Be reusable

Accept props

Be independent

Avoid duplicate logic

Be composable

---

# UI Patterns

Preferred

Cards

Bottom Sheets

FAB

Search

Section Headers

Avoid

Nested Modals

Complex Menus

Hidden Actions

Multiple Floating Buttons

---

# Design Language

The application should feel

Calm

Premium

Professional

Modern

Focused

Purposeful

Minimal

Every screen should answer

"What is the next action?"

---

# Future UI

Future additions

Glassmorphism (limited)

Charts

Widgets

Voice Assistant UI

Knowledge Graph

AI Chat

These should follow the same design language.

---

# Design Rule

Whenever creating a new screen, ask

Can this screen be simpler?

Can one action be removed?

Can whitespace improve readability?

Can the user complete the task in under 10 seconds?

If yes,

choose the simpler option.