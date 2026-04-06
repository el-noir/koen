# KOEN Frontend UX Analysis

Date: 2026-04-05

## Overview

The Stage 1 frontend is now functional enough to prove the KOEN core loop, but the user experience still feels more like a working internal tool than a dependable field app.

The biggest opportunity is no longer missing functionality. It is trust, clarity, and flow.

Right now the interface can capture a note, upload it, process it, and display transcript plus extracted data. That is a strong foundation. The next improvement pass should focus on making the app feel obvious, reliable, and calm to use on a real phone in a real job-site context.

## Progress Since First Analysis

The first highest-impact UX package has started.

What is already improved:

- The recorder now exposes clearer internal states instead of only `Hold to Talk` versus `Recording...`.
- The push-to-talk area now gives better in-context feedback for permission request, active recording, and microphone problems.
- The project detail page now introduces a `Latest note` flow so the newest capture has a more obvious journey from upload to processed result.
- The project shell now behaves better on mobile with `dvh`-based layout and safer bottom spacing for the recorder dock.

What is still incomplete in that same UX goal:

- There is still no cancel gesture or lock-to-record option.
- Error and retry behavior is still inconsistent across the project list, project detail, upload, and confirmation flows.
- The latest note is clearer, but the screen still contains too many competing sections at once.
- Offline confidence is still count-based rather than item-based.

So the trust pass has started, but it has not fully matured into a truly calm end-to-end field workflow yet.

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

- There is still no cancel gesture or lock-to-record option.
- There is still no explicit post-release action surface such as `slide away to cancel`.
- The recording state is clearer now, but the transition between `release`, `uploading`, `processing`, and `done` still lives partly in separate UI regions.
- The recorder still depends on the user understanding the surrounding screen instead of feeling fully self-explanatory on its own.

Why this matters:

A worker should never have to guess whether KOEN heard the note.

Recommended improvements:

- Keep and refine the explicit recorder states:
  - `idle`
  - `requesting_permission`
  - `recording`
  - `uploading`
  - `queued_offline`
  - `processing`
  - `error`
- Keep microphone permission errors inline and make them dismiss/retry friendly.
- Keep the visible recording timer and make it easier to notice at a glance.
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

- Keep `Latest Note` as the primary result block after each recording.
- Collapse older notes by default.
- Move grouped category tabs below the note timeline.
- Reduce the number of simultaneous banners competing for attention.
- Inline confirmation actions into the latest note result when possible.
- Keep the screen hierarchy focused on the most recent outcome first.
- Consider turning older notes into a secondary archive list rather than a full always-open stream.

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
- Show a visible failed state instead of silently leaving the user in an ambiguous loading view.
- Add stronger timeout/failure messaging such as:
  - `Still processing`
  - `Could not process this note`
  - `Try again`

This is a very high-value pass because it reduces uncertainty more than cosmetic changes do.

### 4. Mobile Ergonomics Need More Attention

The product is conceptually mobile-first, but some implementation details still feel desktop-oriented.

Observed issues:

- Tabs may become cramped on narrow screens.
- Some metadata text is very small for field use.
- Confirm/edit actions can still be a bit tight for one-handed usage.

Recommended improvements:

- Keep `dvh`-based layout and safe-area padding in place.
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

### 1. Project Detail Simplification And Priority Cleanup

Implement:

- collapse older notes by default
- reduce competing banners
- make the latest note the clear primary result area
- move category views lower
- make confirmation actions feel attached to the note they came from

### 2. Honest Loading And Failure States

Implement:

- loading vs empty vs error separation
- retry actions
- clearer project load failures
- confirmation and sync failure feedback
- stronger processing timeout states

### 3. Recorder Completion Pass

Implement:

- cancel gesture
- lock-to-record option if longer notes are expected
- tighter handoff between recorder state and latest-note state

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

## What We Should Proceed With Now

The next best UX task is:

**Project Detail Simplification And Priority Cleanup**

Why this should be next:

- The recorder trust pass has already begun and now needs a cleaner destination.
- The main page still makes the user scan too many blocks after recording.
- Reducing screen competition will make every improvement that already exists feel stronger.
- This is the highest-leverage follow-up because it improves clarity without needing backend changes.

The concrete scope should be:

1. Collapse older notes by default
2. Keep one strong `Latest note` result card at the top
3. Reduce duplicate banners when the latest note card already explains the state
4. Push grouped category tabs and older history lower in the hierarchy
5. Attach confirmation actions more tightly to the latest note when possible

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

1. Collapse older notes and introduce a cleaner recent-history pattern
2. Reduce duplicate status surfaces and let `Latest note` carry the main state
3. Add explicit retry states for project load, upload, confirm, and sync
4. Make tabs horizontally scrollable and reduce small-type density
5. Add recorder cancel behavior as the next trust-pass increment

That package would produce the biggest visible UX improvement without changing the product's core architecture.
