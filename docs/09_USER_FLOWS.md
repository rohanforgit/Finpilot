# 🗄️ FinPilot Database Schema
Version: 1.0

---

# Philosophy

The database should be simple.

Do not over-normalize.

Design for readability and maintainability.

Every table should have one clear responsibility.

Authentication will use Supabase Auth.

All application data belongs to a user.

Every table references

auth.users.id

---

# Tables

## profiles

Purpose

Stores user profile information.

Fields

id

full_name

email

currency

country

monthly_income

preferred_cash_balance

investment_preference

created_at

updated_at

---

## monthly_plans

Purpose

Stores one financial plan for each month.

Fields

id

user_id

month

year

salary

other_income

miscellaneous_allowance

remaining_money

status

created_at

updated_at

Relationship

One User

↓

Many Monthly Plans

---

## recurring_expenses

Purpose

Stores recurring monthly expenses.

Examples

Rent

Electricity

Internet

Fuel

Groceries

EMI

SIP

Insurance

Fields

id

plan_id

category

amount

is_active

display_order

---

## annual_expenses

Purpose

Stores yearly expenses.

Examples

School Fees

Amazon Prime

Insurance

Vehicle Service

Fields

id

user_id

title

amount

due_month

monthly_saving

created_at

---

## savings_buckets

Purpose

Tracks yearly savings progress.

Fields

id

annual_expense_id

saved_amount

target_amount

progress_percentage

expected_completion

updated_at

---

## expenses

Purpose

Stores all user expenses.

Fields

id

user_id

merchant

amount

category

expense_type

planned

transaction_date

notes

confidence

source

created_at

---

## merchants

Purpose

AI memory.

Maps merchants to categories.

Example

Swiggy

↓

Dining

Fields

id

user_id

merchant

preferred_category

planned_default

times_used

---

## ai_recommendations

Purpose

Stores AI-generated recommendations.

Fields

id

user_id

title

description

reason

confidence

status

approved

rejected

edited

created_at

---

## recommendation_actions

Purpose

Stores user interaction with recommendations.

Fields

id

recommendation_id

action

edited_amount

approved_at

---

## ai_memory

Purpose

Long-term learning.

Fields

id

user_id

memory_key

memory_value

confidence

last_used

---

## uploads

Purpose

Tracks OCR uploads.

Fields

id

user_id

file_name

status

uploaded_at

processing_time

---

## upload_transactions

Purpose

Stores extracted transactions before approval.

Fields

id

upload_id

merchant

amount

date

category

expense_type

confidence

approved

---

# Relationships

User

↓

Monthly Plans

↓

Recurring Expenses

↓

Expenses

↓

AI Recommendations

↓

AI Memory

↓

Annual Expenses

↓

Savings Buckets

↓

OCR Uploads

↓

Upload Transactions

---

# Data Flow

User

↓

Monthly Plan

↓

Expenses

↓

AI Analysis

↓

Recommendations

↓

User Decision

↓

Memory Updated

---

# Storage Principles

Never duplicate data.

Never overwrite user corrections.

Always preserve history.

---

# Security

Row Level Security

Enabled

Every table filtered by

user_id

Users can only access their own data.

---

# Future Tables

notifications

family_members

bank_connections

calendar_events

investment_accounts

subscription_services

analytics_cache

These are NOT part of the MVP.

---

# Indexing

Index

user_id

month

year

merchant

transaction_date

recommendation status

---

# Backup Strategy

Automatic Supabase backups.

Soft delete important records.

Audit recommendation approvals.

---

# Final Principle

The database should support AI learning without becoming unnecessarily complex.

Every table must exist because it improves the user experience.

If a table does not improve the product, it should not exist.