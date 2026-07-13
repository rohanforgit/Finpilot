# 🏗️ FinPilot Information Architecture
Version: 1.0

---

# Philosophy

Every page must have a single responsibility.

Users should never get lost.

Every feature should be reachable within two clicks.

Navigation should always remain predictable.

---

# Application Structure

Landing Website

↓

Authentication

↓

Onboarding

↓

Main Application

---

# Landing Website

Purpose

Introduce FinPilot.

Convince visitors.

Convert visitors into users.

Pages

Home

Features

How It Works

Pricing (Future)

FAQ

Footer

---

# Authentication

Pages

Login

Signup

Forgot Password

Google Login

Verification

---

# Onboarding

Step 1

Welcome

↓

Step 2

Income

↓

Step 3

Monthly Expenses

↓

Step 4

Investments

↓

Step 5

Annual Expenses

↓

Step 6

Preferences

↓

Generate Plan

↓

Dashboard

---

# Main Navigation

Desktop

Home

Monthly Plan

Savings Buckets

Recommendations

Profile

Floating Action Button

Upload Screenshot

Manual Expense

Quick Note

---

# Home

Purpose

Financial Snapshot

Sections

Greeting

Remaining Money

Plan Progress

Today's AI Insight

Recommendation Preview

Savings Bucket Preview

Recent Expenses

Quick Actions

Recent OCR Upload

---

# Monthly Plan

Purpose

Manage recurring monthly finances.

Sections

Income

Recurring Expenses

Investments

Annual Savings

Miscellaneous Allowance

Remaining Money

Save Button

Reset Month

Duplicate Month

---

# OCR Upload

Purpose

Capture expenses effortlessly.

Sections

Upload Area

Drag and Drop

Recent Uploads

Processing Status

---

# OCR Review

Purpose

Verify AI predictions.

Table

Merchant

Amount

Date

Category

Expense Type

Actions

Approve

Delete

Edit

Approve All

Sticky Bottom Action Bar

---

# Savings Buckets

Purpose

Track yearly savings.

Each Bucket

Title

Target

Saved

Progress

Due Month

AI Suggestion

History

---

# Recommendations

Purpose

Help users make smarter financial decisions.

Sections

Today's Insights

Suggested Allocations

Financial Trends

Warnings

Approved Recommendations

Ask FinPilot

---

# Profile

Purpose

Manage personal financial preferences.

Sections

Income

Monthly Expenses

Annual Expenses

Investment Preferences

AI Memory

Categories

Theme

Export Data

Reset Account

---

# Global Components

Top Navigation

Floating Action Button

Toast Notifications

Confirmation Dialogs

Loading Overlay

Search

Profile Menu

---

# Global Dialogs

Add Expense

Upload Screenshots

Delete Confirmation

Recommendation Approval

Edit Category

Bucket Details

---

# Floating Action Button

Actions

Upload Screenshot

Manual Expense

Quick Note

Always visible.

---

# Search

Future Feature

Global Search

Merchant

Expenses

Buckets

Recommendations

Settings

---

# Notifications

Only meaningful notifications.

Examples

Bucket completed.

Recommendation available.

Large expense detected.

Avoid unnecessary alerts.

---

# Empty States

Every page should explain

What this page does.

Why it's useful.

What users should do next.

---

# Loading States

Skeletons

Animated placeholders

Friendly messages

Never blank screens.

---

# Error States

Human language.

Never technical errors.

Always provide a recovery action.

---

# Mobile Navigation

Bottom Navigation

Floating Action Button

Responsive Cards

Swipe Gestures

Large Touch Targets

---

# Desktop Navigation

Top Navigation

Centered Content

Floating Cards

Maximum Width 1440px

---

# Future Expansion

The architecture should allow adding

Family Accounts

Bank Integrations

Analytics

Calendar

Goals

without redesigning the navigation.

---

# Final Principle

Every screen should answer one question.

If a page starts solving multiple problems,

split it into two pages.