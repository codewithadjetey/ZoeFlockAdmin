# First Timer Logging & Visitor Tracking Feature Plan

## Overview
This feature aims to:
- Log details of first-time church visitors ("first timers") with a set of questions and personal details.
- Track their subsequent visits, updating their status:
  - 1st visit: First Timer
  - 2nd visit: Visitor (status auto-updated)
  - 3rd visit: Notify admin (potential member)
- Notify admin on the third visit.
- **Collect two phone numbers:** Primary (required), Secondary (optional).
- **Support self-registration via QR code.**
- **Enable admin to assign visitor to the correct member/family if not captured during self-registration.**
- **Add action button to convert to member, auto-assigning to inviter's family if available.**
- **Implement device fingerprinting to help prevent repeated self-registration abuse.**
- **Restrict QR code form submissions:**
  - Visitors/first timers can only submit the form once per day.
  - Submission is only allowed on days when there is a program or event.

---

## 1. Database Changes
- **Create `first_timers` table**
  - Fields:
    - `id`
    - `name`
    - `location`
    - `primary_mobile_number` (required)
    - `secondary_mobile_number` (optional)
    - `how_was_service` (text)
    - `is_first_time` (boolean)
    - `has_permanent_place_of_worship` (boolean)
    - `invited_by` (string if available)
    - `invited_by_member_id` (nullable, foreign key to member, for admin/family head assignment)
    - `would_like_to_stay` (boolean)
    - `visit_count` (integer, default 1)
    - `status` (enum: 'first_timer', 'visitor', 'potential_member')
    - `self_registered` (boolean, true if registered via QR code)
    - `assigned_member_id` (nullable, foreign key to member, for admin assignment)
    - `device_fingerprint` (nullable, string, for anti-abuse tracking)
    - `last_submission_date` (date, for QR code submission restriction)
    - `created_at`, `updated_at`

- **Optionally:**
  - Link to `users` or `members` table if/when they become members.

---

## 2. Backend Logic
- **API Endpoint:**
  - `POST /api/v1/first-timers`
    - Accepts all questions and personal details, including both phone numbers.
    - Accepts device fingerprint from frontend (if self-registered).
    - Checks if primary mobile number exists:
      - If yes, increment `visit_count` and update `status` accordingly.
      - If no, create new record with `visit_count = 1` and `status = 'first_timer'`.
    - If self-registered (via QR code), set `self_registered = true`.
    - If device fingerprint is already associated with a first timer, flag or block repeated registration attempts.
    - **Restrict QR code submissions:**
      - Allow only one submission per device/phone number per day.
      - Allow submission only if today is a program/event day (check against events table/schedule).

- **Status Update Logic:**
  - On 2nd visit: set `status = 'visitor'`.
  - On 3rd visit: set `status = 'potential_member'` and trigger admin notification.

- **Conversion to Member:**
  - Add action button in admin dashboard to convert a first timer/visitor to member.
  - When converting, if `invited_by` is set, auto-assign to that member's family.
  - If self-registered and inviter is unknown, allow admin to assign to the correct member/family based on entered details.
  - **Admin can always review and assign the correct inviter/member (e.g., "A or B member invited them") during the conversion or review process.**

---

## 3. Admin Notification
- **Trigger:** On 3rd visit (when `visit_count` becomes 3)
- **Methods:**
  - Email notification to admin(s)
  - Optional: Dashboard alert or notification system
- **Content:**
  - Name, mobile numbers, and a message indicating the person is a potential member.

---

## 4. Frontend (if applicable)
- **Form for Logging First Timer:**
  - Fields for all questions and personal details, including both phone numbers.
  - Validation for required fields (especially primary mobile number).
  - **Capture device fingerprint for self-registration.**
  - **Restrict QR code form submission to once per day and only on event/program days.**
- **Admin Dashboard:**
  - Section to view notifications about potential members.
  - List of all first timers and their statuses.
  - **Action button to convert to member.**
  - **If self-registered, interface for admin to assign to the correct member/family.**
  - **Admin can review and assign inviter/member details if not captured during registration.**
- **QR Code Generator:**
  - Generate QR code for self-registration form.
  - Allow both first timers and visitors to use QR code for self-registration.

---

## 5. Optional Enhancements
- Analytics on first timers and conversion rates.
- Follow-up reminders for admins.
- Integration with member registration flow.

---

## 6. Next Steps
1. Create migration and model for `first_timers` table (with both phone numbers, inviter, self-registration, device fingerprint, last submission date, and assignment fields).
2. Implement API endpoint and controller logic.
3. Add notification logic for admin.
4. Build frontend form, QR code generator, device fingerprinting, and admin dashboard section (including convert-to-member and assignment features).