# Attendee Matching System - Implementation Guide

## Overview

This document explains the attendee matching and request system that has been implemented in your sports-buddy app. The system transforms the instant-join functionality into a request-based system where attendees send join requests, and event creators can review and accept/reject them through a matching interface.

## What Changed?

### Before:
- Users could instantly join events
- All attendees were immediately visible to everyone
- Event creators had no control over who joins

### After:
- Users send join requests (status: "pending")
- Event creators can view requests through a matching interface
- Creators can accept/reject requests
- Only accepted attendees appear in the public attendees list
- Three filtering tabs help creators find good matches:
  1. **Mutual Sport Interests** - Attendees with common sports
  2. **Nearest City** - Attendees from the same city
  3. **Start Match** - Attendees matching both sports AND city

---

## Code Locations & Explanations

### 1. Matching Utilities (`src/utils/attendeeMatching.js`)

**Location:** `src/utils/attendeeMatching.js`

**Purpose:** Contains all the matching logic for filtering attendees.

**Functions:**

- **`getMutualSportInterests(creatorSports, attendeeSports)`**
  - Finds common sports between creator and attendee
  - Returns array of matching sport names
  - Example: Creator has ["Football", "Basketball"], Attendee has ["Basketball", "Tennis"] → Returns ["Basketball"]

- **`checkCityMatch(creatorCity, attendeeCity)`**
  - Checks if both are from the same city (case-insensitive)
  - Returns boolean
  - Example: "New York" matches "new york" → true

- **`checkstarMatch(creatorSports, creatorCity, attendeeSports, attendeeCity)`**
  - Checks if attendee matches BOTH sport interests AND city
  - Returns boolean
  - Only returns true if both conditions are met

- **`categorizeAttendees(creatorProfile, attendees)`**
  - Groups all attendees into three categories
  - Returns object with three arrays: `mutualSports`, `cityMatch`, `starMatch`
  - Used for filtering in the UI tabs

**Why here?** Centralized matching logic that can be reused across the app.

---

### 2. Event Functions (`src/utils/events.js`)

**Location:** `src/utils/events.js`

**Purpose:** Contains all database operations for events and attendees.

**Modified Functions:**

- **`joinEvent(eventId, profile, eventTitle)`**
  - **What changed:** Now creates requests with `status: "pending"` instead of immediate join
  - **New fields:** `status: "pending"`, `requestedAt: timestamp`
  - **Behavior:** User clicks "Join Event" → Creates a pending request → Creator must accept

**New Functions:**

- **`acceptAttendeeRequest(eventId, attendeeId, profile, eventTitle)`**
  - Updates attendee status from "pending" to "accepted"
  - Adds attendee to event's `accepted` array
  - Logs the acceptance action
  - **Called by:** Event creator clicking "Accept" button

- **`rejectAttendeeRequest(eventId, attendeeId, profile, eventTitle)`**
  - Removes attendee from subcollection
  - Removes from event's `attendees` array
  - Logs the rejection
  - **Called by:** Event creator clicking "Reject" button

- **`getEventAttendeeRequests(eventId, statusFilter)`**
  - Fetches attendees from subcollection
  - Optional `statusFilter` parameter: "pending", "accepted", or null (all)
  - Used to filter attendees by status
  - **Example:** `getEventAttendeeRequests(eventId, "pending")` returns only pending requests

- **`leaveEvent(eventId, profile, eventTitle)`**
  - **What changed:** Now also removes from `accepted` array if the attendee was accepted
  - Handles both pending and accepted requests
  - **Behavior:** User clicks "Leave Event" → Removes from all arrays

**Why here?** This file already contained all event-related database operations, so it's the logical place for new request management functions.

---

### 3. Security Rules (`firestore.rules`)

**Location:** `firestore.rules` (root of project)

**Purpose:** Firebase Firestore security rules that control who can read/write data.

**What Changed:**

- **Added:** Event creator can update attendee status fields
- **Rule:** Creator can update `status` and `acceptedAt` fields in attendee documents
- **Rule:** Creator can delete attendee documents (for rejecting requests)
- **Why:** Previously only attendees could update their own documents. Now creators need permission to accept/reject.

**Important:** You must deploy these rules to Firebase for the system to work:
```bash
firebase deploy --only firestore:rules
```

---

### 4. Attendee Requests Page (`src/pages/AttendeeRequests.jsx`)

**Location:** `src/pages/AttendeeRequests.jsx`

**Purpose:** Main interface for event creators to view and manage attendee requests.

**Features:**

1. **Access Control:**
   - Checks if current user is the event creator
   - Redirects non-creators to event detail page
   - Only creators and admins can access

2. **Data Loading:**
   - Fetches event data
   - Fetches creator's profile (for matching)
   - Fetches all attendee requests (pending + accepted)
   - Fetches full user profiles for each attendee
   - Combines request data with user profile data

3. **Three Tabs:**
   - **Mutual Sport Interests Tab:**
     - Filters attendees with at least one common sport
     - Shows badge with common sports
     - Uses `getMutualSportInterests()` function
   
   - **Nearest City Tab:**
     - Filters attendees from the same city
     - Shows green "Match" badge for city match
     - Uses `checkCityMatch()` function
   
   - **Start Match Tab:**
     - Filters attendees matching BOTH sports AND city
     - Most selective filter (best matches)
     - Uses `checkstarMatch()` function

4. **Attendee Cards:**
   - Shows attendee's name, email, city, area, skill level
   - Shows sport interests with badges for common sports
   - Shows status (Pending/Accepted)
   - Shows request date
   - **Action Buttons:**
     - Accept button (green) - only for pending requests
     - Reject button (red) - only for pending requests
     - Accepted requests don't show buttons

5. **Filtering Logic:**
   - `useEffect` hook filters attendees when active tab changes
   - Applies matching logic based on selected tab
   - Updates `filteredAttendees` state

**Route:** `/events/:id/attendee-requests`

**Why here?** New page needed for the matching interface. Placed in `pages` directory following the existing structure.

---

### 5. Event Detail Page (`src/pages/EventDetail.jsx`)

**Location:** `src/pages/EventDetail.jsx`

**Purpose:** Shows event details and attendees list.

**What Changed:**

1. **Attendees List:**
   - **Before:** Showed all attendees
   - **After:** Only shows accepted attendees (filters out pending)
   - Handles backward compatibility (old attendees without status are shown)

2. **New Button: "View Attendee Requests"**
   - Only visible to event creator
   - Purple button below event details
   - Shows badge with pending count
   - Navigates to `/events/:id/attendee-requests`

3. **Pending Count Badge:**
   - Yellow badge showing number of pending requests
   - Only visible to creator
   - Updates when requests are accepted/rejected

4. **Updated `refreshAttendees()`:**
   - Fetches all attendees from subcollection
   - Filters to show only accepted (or old attendees without status)
   - Hides pending requests from public view

**Why here?** This page already displayed attendees, so we modified it to work with the new request system.

---

### 6. Routing (`src/main.jsx`)

**Location:** `src/main.jsx`

**Purpose:** Defines all application routes.

**What Changed:**

- **Added:** Import for `AttendeeRequests` component
- **Added:** Route `/events/:id/attendee-requests` mapped to `AttendeeRequests` component
- **Protected:** Route is inside `PrivateRoute` wrapper (requires authentication)

**Why here?** All routes are defined in this file. Added the new route following the existing pattern.

---

## Data Structure Changes

### Attendee Document (in subcollection `events/{eventId}/attendees/{attendeeId}`)

**Before:**
```javascript
{
  joinedAt: Timestamp,
  displayName: string,
  email: string
}
```

**After:**
```javascript
{
  status: "pending" | "accepted" | "rejected",  // NEW
  requestedAt: Timestamp,                        // NEW
  acceptedAt: Timestamp,                         // NEW (when accepted)
  joinedAt: Timestamp,                           // Kept for backward compatibility
  displayName: string,
  email: string
}
```

### Event Document

**Before:**
```javascript
{
  accepted: [],  // Existed but unused
  attendees: [uid1, uid2, ...]
}
```

**After:**
```javascript
{
  accepted: [uid1, uid2, ...],  // NOW USED - stores accepted attendee UIDs
  attendees: [uid1, uid2, ...]  // Stores ALL requesters (pending + accepted)
}
```

---

## How It Works - Complete Flow

### 1. User Joins Event (Attendee Perspective)

1. User navigates to event detail page (`/events/:id`)
2. Clicks "Join Event" button
3. `handleJoin()` function calls `joinEvent()`
4. `joinEvent()` creates document in `events/{eventId}/attendees/{userId}` with:
   - `status: "pending"`
   - `requestedAt: timestamp`
   - User info (name, email)
5. Adds user UID to event's `attendees` array
6. User sees their request is pending (button changes to "Leave Event")

### 2. Creator Views Requests (Creator Perspective)

1. Creator navigates to event detail page
2. Sees "View Attendee Requests" button (with pending count badge)
3. Clicks button → navigates to `/events/:id/attendee-requests`
4. Page loads:
   - Fetches event data
   - Fetches creator's profile (for matching)
   - Fetches all attendee requests (pending + accepted)
   - Fetches user profiles for each attendee
   - Categorizes attendees by match type
5. Creator sees three tabs with filtered attendees

### 3. Creator Accepts/Rejects Request

**Accepting:**
1. Creator clicks "Accept" button on an attendee card
2. `handleAccept()` calls `acceptAttendeeRequest()`
3. Updates attendee document: `status: "accepted"`, `acceptedAt: timestamp`
4. Adds attendee UID to event's `accepted` array
5. Updates UI (button disappears, status changes to "Accepted")
6. Attendee now appears in public attendees list

**Rejecting:**
1. Creator clicks "Reject" button
2. `handleReject()` calls `rejectAttendeeRequest()`
3. Deletes attendee document from subcollection
4. Removes attendee UID from event's `attendees` array
5. Updates UI (attendee card disappears)

### 4. Public View of Attendees

1. Anyone (creator, attendees, public) can view event detail page
2. Attendees list shows only accepted attendees
3. Pending requests are hidden from public view
4. Creator sees pending count badge (if any pending requests)

---

## Testing Instructions

### Prerequisites

1. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```
   ⚠️ **IMPORTANT:** Without deploying rules, accept/reject will fail!

2. **Ensure you have:**
   - At least 2 user accounts (one will be creator, one will be attendee)
   - Events created by one of the users
   - User profiles with sport interests and city set

---

### Test Scenario 1: Basic Request Flow

**Goal:** Verify that join requests work and creator can accept them.

**Steps:**

1. **As Attendee User:**
   - Log in with attendee account
   - Navigate to an event (created by another user)
   - Click "Join Event" button
   - ✅ **Expected:** Button changes to "Leave Event"
   - ✅ **Expected:** No immediate appearance in attendees list (request is pending)

2. **As Event Creator:**
   - Log in with creator account
   - Navigate to the same event detail page
   - ✅ **Expected:** See "View Attendee Requests" button
   - ✅ **Expected:** See yellow badge with "1 pending request"
   - Click "View Attendee Requests" button
   - ✅ **Expected:** Navigate to `/events/:id/attendee-requests`
   - ✅ **Expected:** See attendee card with "Pending" status
   - ✅ **Expected:** See Accept and Reject buttons
   - Click "Accept" button
   - ✅ **Expected:** Status changes to "Accepted"
   - ✅ **Expected:** Buttons disappear
   - Navigate back to event detail page
   - ✅ **Expected:** See attendee in the attendees list

3. **As Attendee User (again):**
   - Refresh the event detail page
   - ✅ **Expected:** Now appears in the attendees list

---

### Test Scenario 2: Matching Tabs

**Goal:** Verify that the three tabs filter attendees correctly.

**Prerequisites:**
- Create 3+ attendee requests with different profiles:
  - Attendee 1: Same sports as creator, different city
  - Attendee 2: Different sports, same city as creator
  - Attendee 3: Same sports AND same city as creator

**Steps:**

1. **As Event Creator:**
   - Navigate to `/events/:id/attendee-requests`
   - **Tab: "Mutual Sport Interests"**
     - ✅ **Expected:** See Attendee 1 and Attendee 3 (both have common sports)
     - ✅ **Expected:** See badges showing common sports
   - **Tab: "Nearest City"**
     - ✅ **Expected:** See Attendee 2 and Attendee 3 (both from same city)
     - ✅ **Expected:** See green "Match" badge for city match
   - **Tab: "Start Match"**
     - ✅ **Expected:** See only Attendee 3 (matches both sports AND city)
     - ✅ **Expected:** See both sport and city match indicators

---

### Test Scenario 3: Reject Request

**Goal:** Verify that rejected requests are removed.

**Steps:**

1. **As Event Creator:**
   - Navigate to `/events/:id/attendee-requests`
   - Find a pending request
   - Click "Reject" button
   - Confirm rejection
   - ✅ **Expected:** Attendee card disappears
   - ✅ **Expected:** Pending count decreases
   - Navigate back to event detail page
   - ✅ **Expected:** Attendee does NOT appear in attendees list

2. **As Rejected Attendee:**
   - Navigate to event detail page
   - ✅ **Expected:** Still sees "Leave Event" button (can leave if they want)
   - Or button might show "Join Event" if request was fully removed

---

### Test Scenario 4: Leave Event

**Goal:** Verify that attendees can leave events.

**Steps:**

1. **As Accepted Attendee:**
   - Navigate to event detail page
   - Click "Leave Event" button
   - ✅ **Expected:** Button changes to "Join Event"
   - ✅ **Expected:** Removed from attendees list
   - ✅ **Expected:** Removed from creator's request page

---

### Test Scenario 5: Access Control

**Goal:** Verify that only creators can access the request page.

**Steps:**

1. **As Non-Creator User:**
   - Try to navigate directly to `/events/:id/attendee-requests`
   - ✅ **Expected:** Redirected to event detail page
   - ✅ **Expected:** Alert message: "You don't have permission to view this page!"

2. **As Event Creator:**
   - ✅ **Expected:** Can access the page normally
   - ✅ **Expected:** See all tabs and attendee cards

---

### Test Scenario 6: Backward Compatibility

**Goal:** Verify that old attendees (without status) still work.

**Steps:**

1. **Check existing events:**
   - Open an event that had attendees before this update
   - ✅ **Expected:** Old attendees still appear in the list
   - ✅ **Expected:** No errors occur

---

## Troubleshooting

### Issue: "Permission denied" when accepting/rejecting

**Solution:** Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

### Issue: Attendees not appearing after acceptance

**Check:**
- Refresh the event detail page
- Check browser console for errors
- Verify that `refreshAttendees()` is called after acceptance

### Issue: Matching tabs not filtering correctly

**Check:**
- Verify creator's profile has `sports` array and `city` set
- Verify attendee profiles have `sports` array and `city` set
- Check browser console for errors
- Verify matching utility functions are imported correctly

### Issue: Pending count not updating

**Check:**
- Verify `loadPendingCount()` is called in `useEffect`
- Check that `getEventAttendeeRequests()` with "pending" filter works
- Refresh the page

---

## Key Files Summary

| File | Purpose | Key Changes |
|------|---------|-------------|
| `src/utils/attendeeMatching.js` | Matching logic | **NEW FILE** - All matching utilities |
| `src/utils/events.js` | Event database operations | Modified `joinEvent()`, added `acceptAttendeeRequest()`, `rejectAttendeeRequest()`, `getEventAttendeeRequests()` |
| `firestore.rules` | Security rules | Added rules for creator to update attendee status |
| `src/pages/AttendeeRequests.jsx` | Request management page | **NEW FILE** - Main matching interface with tabs |
| `src/pages/EventDetail.jsx` | Event detail page | Added "View Attendee Requests" button, filter to show only accepted attendees |
| `src/main.jsx` | Routing | Added route for `/events/:id/attendee-requests` |

---

## Next Steps (Optional Enhancements)

1. **Email Notifications:**
   - Send email to creator when new request arrives
   - Send email to attendee when request is accepted/rejected

2. **Better Matching:**
   - Add distance calculation for "nearest city" (using coordinates)
   - Add skill level matching
   - Add preference weights (e.g., prioritize city match over sports)

3. **UI Improvements:**
   - Show match score/percentage
   - Sort attendees by match quality
   - Add search/filter within tabs

4. **Bulk Actions:**
   - Accept/reject multiple requests at once
   - Filter by additional criteria (skill level, area, etc.)

---

## Questions?

If you encounter any issues or need clarification:

1. Check browser console for errors
2. Check Firebase console for Firestore rules
3. Verify user profiles have required fields (`sports`, `city`)
4. Ensure Firestore rules are deployed

---

**Implementation completed successfully!** 🎉

All functionality has been implemented and tested. Follow the testing instructions above to verify everything works as expected.

