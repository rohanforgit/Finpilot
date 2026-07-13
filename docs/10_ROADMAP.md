# 🏛️ FinPilot Technical Architecture
Version: 1.0

---

# Philosophy

The architecture should prioritize

• Simplicity
• Scalability
• Maintainability
• Type Safety
• Performance

Every feature should be modular.

Business logic should never exist inside UI components.

---

# Technology Stack

Framework

Next.js 15 (App Router)

Language

TypeScript

Package Manager

pnpm

Styling

Tailwind CSS

Component Library

shadcn/ui

Animation

Framer Motion

Icons

Lucide React

Charts

Recharts

Authentication

Supabase Auth

Database

Supabase PostgreSQL

Storage

Supabase Storage

AI

Google Gemini

OCR

Gemini Vision

Validation

Zod

Forms

React Hook Form

State Management

Zustand

Data Fetching

TanStack Query

Date Handling

date-fns

Notifications

Sonner

Theme

next-themes

Deployment

Vercel

---

# Project Structure

app/

components/

features/

hooks/

lib/

services/

stores/

types/

utils/

public/

docs/

prompts/

---

# Folder Responsibilities

app/

Routing

Pages

Layouts

components/

Reusable UI

Buttons

Cards

Dialogs

Inputs

features/

Business modules

Dashboard

OCR

Recommendations

Buckets

Monthly Plan

Profile

services/

External integrations

Gemini

OCR

Supabase

Authentication

stores/

Global state

Theme

User

Current Month

AI

utils/

Helpers

Formatting

Currency

Date

Calculations

types/

Application types

Database types

API responses

---

# Feature Architecture

Each feature should contain

components/

hooks/

services/

types/

utils/

Example

features/

dashboard/

components/

hooks/

services/

types/

utils/

---

# Authentication Flow

Landing

↓

Login

↓

Supabase Auth

↓

Middleware Validation

↓

Dashboard

Protected Routes

All application routes require authentication.

---

# Data Flow

UI

↓

Feature Hook

↓

Service

↓

Supabase

↓

Return Data

↓

Update State

↓

Render

Business logic never belongs inside components.

---

# AI Flow

User Action

↓

Collect Financial Context

↓

Generate Prompt

↓

Gemini API

↓

Receive Response

↓

Validate Response

↓

Store Recommendation

↓

Render UI

---

# OCR Flow

Upload

↓

Gemini Vision

↓

Extract Transactions

↓

Temporary Storage

↓

Review Screen

↓

Approval

↓

Database

---

# State Management

Global

User

Theme

Current Month

Notifications

Temporary OCR State

Everything else should remain local.

---

# API Design

Server Actions preferred.

Fallback to Route Handlers when required.

Never expose API keys.

All AI requests happen server-side.

---

# Environment Variables

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

GOOGLE_GEMINI_API_KEY

NEXT_PUBLIC_APP_URL

---

# Error Handling

Every request should return

Loading

Success

Empty

Error

No silent failures.

---

# Logging

Log

AI Errors

OCR Errors

Database Errors

Authentication Errors

Never log sensitive financial data.

---

# Performance

Lazy load heavy components.

Code split routes.

Optimize images.

Cache recommendations.

Use optimistic UI where appropriate.

---

# Security

Enable Row Level Security.

Validate every request.

Never trust client input.

Encrypt sensitive fields when required.

Never expose service keys.

---

# Accessibility

Keyboard navigation.

Proper labels.

ARIA support.

Color contrast.

Screen reader support.

---

# Coding Standards

Strict TypeScript

Reusable Components

No duplicated logic

Functional Components

Meaningful names

Small files

Reusable hooks

Consistent formatting

---

# Testing Strategy

Unit Tests

Utility Functions

Integration Tests

OCR Pipeline

Recommendation Engine

Manual Testing

Authentication

Monthly Planning

OCR

AI

Mobile

Desktop

---

# Deployment

GitHub

↓

Vercel

↓

Supabase

↓

Gemini API

Production Environment

Automatic Deployments

---

# Future Scalability

Architecture should support

Family Accounts

Multiple Profiles

Bank Integrations

Push Notifications

Offline Mode

Analytics

Without major restructuring.

---

# Final Principle

The architecture should make adding new features easier, not harder.

Every feature should plug into the system without affecting unrelated modules.