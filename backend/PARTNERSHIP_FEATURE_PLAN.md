# Partnership Feature Plan

## Overview

The Partnership feature is designed to help members track their financial commitments (pledges) to the church. It will be accessible as a sub-menu under the Financials section in the sidebar.

## Purpose
- Enable members and administrators to record, manage, and track financial pledges.
- Automate the creation of pledge records based on selected frequency.
- Notify administrators before pledges are due. (On hold for now)

## User Flow
1. **Select a Member**: Choose the member making the pledge.
2. **Select a Category**: Choose the type of partnership/pledge.
3. **Enter Pledge Details**:
    - Pledge Amount
    - Frequency (Weekly, Monthly, Yearly, One-Time)
    - Start Date
    - End Date (if applicable)
    - Notes (optional)
4. **Save**: System creates the pledge and schedules records based on frequency.

## Categories (Create a seeded data for this)
- Church Project
- Rhapsody
- Foundation School

## Frequency Options (Create an Enum for this)
- Weekly
- Monthly
- Yearly
- One-Time

## Data Fields (Create a migration for this)
- Member (reference to member profile)
- Category (enum: Church Project, Rhapsody, Foundation School)
- Pledge Amount (currency)
- Frequency (enum: Weekly, Monthly, Yearly, One-Time)
- Start Date (date)
- End Date (date, optional for One-Time)
- Notes (text, optional)
- Created By (admin/user reference)
- Created At (timestamp)

## Record Creation Logic
- Upon saving a pledge, the system generates a record for each due date based on the selected frequency:
    - **Weekly**: One record per week from start to end date
    - **Monthly**: One record per month from start to end date
    - **Yearly**: One record per year from start to end date
    - **One-Time**: Single record on the start date

## Notification System
- Admin receives a notification 3 days before each pledge is due.
- The due date is determined by the frequency and the schedule generated.

## Example
- Member pledges GHS10,000 monthly for Church Project from Jan 1, 2025 to Dec 1, 2025.
    - System creates 12 records (one for each month).
    - Admin is notified on Dec 28, Jan 29, etc., 3 days before each due date.

## Implementation Notes
- Integrate with existing member and financial modules.
- Ensure proper validation for dates and amounts.
- Support for editing and deleting pledges and their schedules.
- UI/UX: Partnership sub-menu under Financials, with forms and tables for management.

---

*This document outlines the requirements and plan for the Partnership feature. Further technical details and API specifications will be added during implementation.*