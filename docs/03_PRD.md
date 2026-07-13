# 📘 FinPilot Product Requirements Document (PRD)

Version: 1.0
Status: MVP

---

# Product Summary

FinPilot is an AI-assisted monthly financial planning application designed for salaried individuals and families.

Unlike traditional finance apps that focus on expense tracking or banking integration, FinPilot focuses on planning, understanding, and optimizing monthly finances.

The application's primary objective is to reduce manual financial management while providing intelligent recommendations.

---

# MVP Goals

Users should be able to

✅ Create their monthly financial plan

✅ Record unexpected expenses

✅ Upload UPI screenshots

✅ Let AI categorize transactions

✅ Review AI results

✅ Track annual savings

✅ Receive financial recommendations

---

# Primary Navigation

1. Home
2. Monthly Plan
3. Savings Buckets
4. AI Recommendations
5. Profile

Floating Action Button

• Upload Screenshot

• Manual Expense

• Quick Note

---

# Module 1

## Authentication

Requirements

Email Login

Google Login

Forgot Password

Remember User

Dark Theme

Animated transitions

Success animation after login

---

# Module 2

## Onboarding

Purpose

Understand the user's financial life.

Questions

Income

Income Sources

Monthly Salary

Household Members

Recurring Monthly Expenses

Investments

Annual Expenses

Investment Preference

Emergency Fund

Preferred Cash Balance

Miscellaneous Spending

Finish

↓

Generate Financial Plan

---

# Module 3

## Home Dashboard

Cards

Remaining Money

Plan Progress

AI Insight

Annual Bucket Preview

Recent Expenses

Recommendations

Quick Upload

Quick Add Expense

Features

Animated numbers

Smooth progress bars

Responsive layout

Dark theme

---

# Module 4

## Monthly Plan

Sections

Income

Recurring Expenses

Investments

Annual Savings

Miscellaneous Budget

Remaining Money

Actions

Edit

Save

Duplicate

Reset Month

Auto Copy Previous Month

---

# Module 5

## OCR Upload

Supports

Paytm

PhonePe

Google Pay

Gallery Images

Multiple Images

Features

Batch Upload

Progress Indicator

OCR Processing

Merchant Detection

Amount Detection

Date Detection

Category Prediction

Planned vs Miscellaneous Prediction

---

# Module 6

## OCR Review

Display

Merchant

Amount

Date

Category

Type

User Actions

Approve

Delete

Edit

Change Category

Mark Planned

Mark Miscellaneous

Approve All

Nothing saves until approved.

---

# Module 7

## Expense Management

Types

Planned Expense

Miscellaneous Expense

Large Expense

Large expenses ask

"What was this for?"

Examples

School Fees

Vacation

Insurance

Furniture

Medical

Other

---

# Module 8

## Savings Buckets

Each Bucket Contains

Name

Target Amount

Saved

Progress

Due Month

Suggested Monthly Saving

Expected Completion

AI Recommendation

---

# Module 9

## AI Recommendation Engine

AI continuously analyzes

Remaining Money

Savings

Miscellaneous Spending

Bucket Progress

Monthly Trends

AI can recommend

Increase SIP

Recurring Deposit

Loan Prepayment

Emergency Fund

Increase Savings

Reduce Spending

Every recommendation contains

Reason

Confidence

Approve

Edit

Reject

Nothing is applied automatically.

---

# Module 10

## Financial Memory

AI remembers

Merchant Categories

Investment Preferences

Rejected Suggestions

Accepted Suggestions

Recurring Miscellaneous Spending

Annual Spending Pattern

Seasonal Expenses

Never change user data automatically.

Always ask.

---

# Module 11

## Profile

Income

Recurring Expenses

Annual Expenses

Investment Preferences

Theme

AI Preferences

Categories

Export Data

Reset Data

---

# Non Functional Requirements

Application should be

Fast

Responsive

Accessible

Mobile Friendly

Dark Theme First

Offline tolerant where possible

Smooth animations

Minimal loading

---

# Performance Goals

Dashboard

<1 second

OCR Review

<5 seconds

Recommendations

<2 seconds

Navigation

Instant

---

# Security

User Authentication

Encrypted Storage

Secure APIs

No banking credentials

No financial transactions

No automatic investments

---

# Success Criteria

Users can finish onboarding in under 5 minutes.

Users can upload 20 screenshots simultaneously.

Users approve OCR with less than 30 seconds of review.

Users understand their monthly financial position within 10 seconds of opening Home.

Users trust AI recommendations because every suggestion includes an explanation.

---

# Out of Scope (MVP)

Bank Account Integration

UPI Payments

Stock Trading

Crypto

Expense Splitting

Business Accounting

GST

Invoice Management

Net Worth Tracking

Portfolio Tracking

Loan Marketplace

Insurance Marketplace