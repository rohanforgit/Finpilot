# 📷 FinPilot OCR Engine
Version: 1.0

---

# Purpose

The OCR Engine transforms screenshots of digital payments into structured financial data.

The goal is to eliminate manual expense entry while keeping users in complete control.

OCR is an assistant.

It never saves data automatically.

---

# Supported Inputs

Initial MVP

✓ Paytm Screenshots

✓ PhonePe Screenshots

✓ Google Pay Screenshots

Future

• PDF Statements

• Email Receipts

• SMS Messages

• Credit Card Statements

---

# User Flow

Upload Screenshots

↓

AI Reads Image

↓

Extract Transactions

↓

Predict Categories

↓

Predict Expense Type

↓

Review Screen

↓

User Confirms

↓

Save

↓

Dashboard Updates

↓

Recommendations Refresh

---

# OCR Responsibilities

Extract

• Merchant Name

• Amount

• Date

• Time (if available)

• Transaction Type

Predict

• Category

• Planned or Miscellaneous

• Merchant

Detect

• Duplicate Transactions

• Large Expenses

• Possible OCR Errors

---

# Batch Upload

Users should upload

1

5

10

20 screenshots

All images are processed together.

One review screen.

One confirmation.

---

# Review Screen

Every detected transaction should display

Merchant

Amount

Date

Category

Expense Type

Confidence

User Actions

Edit

Delete

Approve

Approve All

Nothing is saved until confirmation.

---

# Planned vs Miscellaneous

AI predicts whether an expense belongs to

Planned Monthly Expense

or

Miscellaneous Expense

Users can change it.

AI remembers the correction.

---

# Merchant Learning

Unknown Merchant

↓

Ask User

↓

Save Category

↓

Future Uploads Automatic

Example

Paradise Biryani

↓

Dining

↓

Remember Forever

---

# Large Expense Detection

When amount exceeds user-defined threshold

Ask

"What was this expense for?"

Options

Medical

Vacation

Education

Insurance

Shopping

Furniture

Vehicle

Other

Store context.

Improve future recommendations.

---

# Duplicate Detection

Prevent

Uploading the same screenshot twice

Uploading the same transaction twice

Duplicate confidence should be displayed.

Never auto-delete.

---

# Confidence System

Each transaction should display

High

Medium

Low

or

Percentage

Low confidence transactions should be highlighted.

---

# Loading Experience

Never show

Loading...

Instead

Reading screenshots...

Extracting transactions...

Understanding merchants...

Categorizing expenses...

Building your financial snapshot...

---

# Error Handling

Unreadable Image

↓

Ask user to retry

Poor Quality

↓

Suggest clearer screenshot

Partial Detection

↓

Highlight missing fields

---

# AI Memory

Remember

Merchant

Category

Expense Type

Corrections

Never ask the same question twice.

---

# Performance Goals

Single Screenshot

<2 seconds

10 Screenshots

<5 seconds

20 Screenshots

<8 seconds

---

# Security

Images processed securely.

Do not permanently store screenshots unless the user explicitly enables history.

Only extracted financial information should be stored.

---

# Success Criteria

Users should be able to upload multiple screenshots and review all detected transactions in under one minute.

The OCR experience should feel effortless, trustworthy and transparent.

The user should always feel in control.