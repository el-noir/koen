# KOEN Frontend UX Analysis

Date: 2026-04-05

## Overview

The Stage 1 frontend is now functional enough to prove the KOEN core loop, but the user experience still feels more like a working internal tool than a dependable field app.

The biggest opportunity is no longer missing functionality. It is trust, clarity, and flow.

Right now the interface can capture a note, upload it, process it, and display transcript plus extracted data. That is a strong foundation. The next improvement pass should focus on making the app feel obvious, reliable, and calm to use on a real phone in a real job-site context.

## Current UX Strengths

- The fixed bottom push-to-talk interaction is the right primary control.
- The project detail page now surfaces transcript and extracted data together.
- Offline queueing exists and supports the field-work reality of unstable connectivity.
- Backend error details are now surfaced better through the web client.
- The app is installable as a PWA, which supports the intended mobile-first workflow.

## Core UX Problem

The current frontend still asks the worker to interpret too much.

Typical unanswered questions during use are:

- Did recording actually start?
- Is the note still processing or did something fail?
- Where should I look for the result?
- Why am I seeing confirmations, recent notes, and category tabs at the same time?

The most important shift is to make KOEN feel like a single-purpose walkie-talkie tool rather than a generic app with voice features added on top.

## Key Findings

### 1. Recording Does Not Feel Trustworthy Enough

The recorder works, but it still lacks visible states that help a user trust what just happened.

Current gaps:

- Recording errors are only logged to the console.
- There is no visible permission-denied state.
- There is no recording timer.
- There is no explicit uploading state tied to the note.
- There is no cancel gesture or lock-to-record option.
- The button only switches between `Hold to Talk` and `Recording...`.

Why this matters:

A worker should never have to guess whether KOEN heard the note.

Recommended improvements:

- Add explicit recorder states:
  - `idle`
  - `requesting_permission`
  - `recording`
  - `uploading`
  - `queued_offline`
  - `processing`
  - `error`
- Show microphone permission errors inline.
- Add a visible recording timer.
- Show immediate transitions after release:
  - `Uploading note...`
  - `Saved offline`
  - `Processing note...`
- Add a cancel gesture:
  - hold and slide away to cancel
  - or a lock-to-record mode for longer recordings
- Strengthen the visual feel of the recorder dock so it feels like the app's main action surface.

### 2. The Project Detail Screen Is Too Busy

The main site page currently combines several views of the same information:

- status banners
- offline/sync banners
- processing banners
- pending confirmation cards
- recent notes timeline
- grouped category tabs
- fixed recorder dock

This creates cognitive load at exactly the point where the app should feel simplest.

Why this matters:

After recording, the worker's mental model is usually just:

"Show me what KOEN heard, and let me fix it if needed."

Recommended improvements:

- Make `Latest Note` the primary result block after each recording.
- Collapse older notes by default.
- Move grouped category tabs below the note timeline.
- Reduce the number of simultaneous banners competing for attention.
- Inline confirmation actions into the latest note result when possible.
- Keep the screen hierarchy focused on the most recent outcome first.

Suggested hierarchy:

1. Recorder
2. Latest note result
3. Needs confirmation
4. Recent note history
5. Category views

### 3. Loading And Failure States Are Not Honest Enough

There are still several places where failure is either silent or visually ambiguous.

Examples:

- A failed projects fetch can fall through into an empty-looking state.
- A failed project-detail fetch can leave the screen in a perpetual loading state.
- Confirmation save failures are only logged to the console.
- Processing timeout messaging is still too vague.

Recommended improvements:

- Distinguish clearly between:
  - `loading`
  - `empty`
  - `error`
- Add retry actions for:
  - project list load
  - project detail load
  - upload failure
  - queue sync failure
  - confirmation save failure
- Surface backend messages inline when useful.
- Add stronger timeout/failure messaging such as:
  - `Still processing`
  - `Could not process this note`
  - `Try again`

This is a very high-value pass because it reduces uncertainty more than cosmetic changes do.

### 4. Mobile Ergonomics Need More Attention

The product is conceptually mobile-first, but some implementation details still feel desktop-oriented.

Observed issues:

- Full-screen layout relies on `h-screen` rather than `dvh`-friendly behavior.
- The bottom recorder dock does not explicitly account for device safe areas.
- Tabs may become cramped on narrow screens.
- Some metadata text is very small for field use.
- Confirm/edit actions can still be a bit tight for one-handed usage.

Recommended improvements:

- Use `min-h-dvh` instead of `h-screen` for the main app shell.
- Add bottom safe-area padding using `env(safe-area-inset-bottom)`.
- Make tabs horizontally scrollable on small screens.
- Increase tiny metadata text slightly where readability matters.
- Increase tap-target size for key actions.
- Use mobile-friendly input hints such as numeric input modes where appropriate.

### 5. Site Creation Still Has Too Much Friction

The current create-site form asks for:

- site name
- client
- start date
- stage

That is reasonable for admin setup, but it is not the lightest path for a voice-first tool.

Recommended improvements:

- Make site creation require only the site name initially.
- Move client, start date, and stage into optional details.
- Or split creation into a quick first step and optional second step.

The ideal Stage 1 path is:

"Create site name -> start recording."

### 6. Confirmation UX Works But Needs Prioritization

The confirmation system is functional, but every unconfirmed item currently appears in the same style and priority.

Recommended improvements:

- Sort confirmations by newest note first.
- Group confirmations by note.
- Show why confirmation is needed when possible.
- Use simpler action language such as:
  - `Looks right`
  - `Edit`
- Improve hours editing with more task-shaped inputs rather than generic text inputs.

### 7. Offline UX Needs Better Trust Signals

The offline queue exists, but the user mostly sees a count rather than a clear representation of what is waiting.

Recommended improvements:

- Add a simple queue drawer or sheet.
- Show queued note timestamps and site association.
- Show `Last synced` information.
- Add a manual `Sync now` action.
- Keep an offline-saved note visible in the recent-note timeline until it uploads.

This matters because the app must prove that the note is safe even when the connection is not.

### 8. The Visual Language Still Feels More Generic Than Intentional

The structure is serviceable, but the visual system still reads closer to a starter dashboard than a field tool.

Recommended improvements:

- Make the recorder more visually dominant.
- Reduce reliance on tiny uppercase metadata labels.
- Use stronger contrast and clearer hierarchy.
- Make result blocks and confirmation cards feel more tactile and purpose-built.
- Push the interface further toward a job-site device feel rather than a generic app shell.

This does not require a full redesign. It requires a more decisive visual hierarchy around the recorder, latest note, and confirmations.

## Highest-Impact Improvement Order

### 1. Recorder Trust Pass

Implement:

- explicit recorder states
- permission and upload error UI
- recording timer
- stronger uploading/processing transitions
- cancel gesture

### 2. Project Detail Simplification

Implement:

- latest-note hero block
- collapsed older notes
- lower-priority grouped tabs
- fewer competing status banners

### 3. Honest Loading And Failure States

Implement:

- loading vs empty vs error separation
- retry actions
- clearer processing timeout states

### 4. Mobile Ergonomics Pass

Implement:

- `dvh`-based layout
- safe-area padding
- scrollable tabs
- larger tap targets and more readable metadata

### 5. Quick Site Creation Flow

Implement:

- name-first creation flow
- optional metadata afterwards

## Strongest Recommendation

The single most important UX improvement is this:

**Make the note capture flow feel trustworthy from press to processed result.**

That means:

- the worker sees recording start
- the worker sees upload happen
- the worker sees a new pending note appear immediately
- the worker sees transcript and extracted data replace that pending state
- the worker gets a clear explanation if anything fails

If KOEN gets that experience right, the whole product will feel dramatically more real and dependable.

## Suggested Next UX Implementation Package

A practical next package would include:

1. Recorder state model and inline recorder feedback
2. Latest note hero card with progressive processing states
3. Error and retry states for list/detail/upload/confirm
4. Mobile-safe layout refinements

That package would produce the biggest visible UX improvement without changing the product's core architecture.
