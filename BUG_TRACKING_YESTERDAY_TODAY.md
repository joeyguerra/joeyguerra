# Bug Tracking (Yesterday / Today)


## Ongoing Updates
- When we find a bug: add a new entry at the bottom using the template below
- Before logging it: ask whether you want it included (we only document bugs found during actual app usage, not incidental bugs fixed during development)
- When we fix a bug: fill in **Fix** and **Verification** (how we confirmed it)
- If a bug is a repeat: link it back to the original entry and note what regressed

### New Bug Entry Template
Copy/paste this block and fill it in:

## N) Short title (YYYY-MM-DD)
- **Area:** `pages/yesterday-today.html` (or other file)
- **Symptom:** What the user saw
- **Impact:** Who/what it affects (data loss, visual only, breaks load, etc)
- **Root cause:** Why it happened
- **Fix:** What changed
- **Verification:** Steps to confirm it’s fixed (include timezone/date edge cases if relevant)

## 1) Syntax error: Parser error (around `yesterday-today.html:651`)
- **Symptom:** Page wouldn’t load due to a JS parse failure
- **Cause:** Malformed/duplicated function block introduced during mission feature edits
- **Fix:** Removed the duplicate/dangling code and corrected function boundaries

## 2) Orphaned `}` (around line ~654)
- **Symptom:** JS parse failure / runtime blocked
- **Cause:** Extra closing brace left behind after edits
- **Fix:** Removed the orphan brace

## 3) Feedback POST endpoint 404
- **Symptom:** Submitting feedback returned 404 at `/api/feedback`
- **Cause:** In this repo/runtime, the working endpoint was `/api/feedback.html` (not `/api/feedback`)
- **Fix:** Updated the frontend to post to `/api/feedback.html` (and/or routing was adjusted)

## 4) Feedback submit button stayed disabled after first submission
- **Symptom:** Users could submit feedback once, then the submit button remained disabled on subsequent attempts
- **Cause:** Submit button disabled during submit flow and not reliably re-enabled/reset on close/reset
- **Fix:** Re-enabled the submit button when closing/resetting the feedback modal (and ensured state resets)

## 5) Avoidance/mission UI ternary parsing bug (line ~1348)
- **Symptom:** `SyntaxError: Unexpected identifier 's'. Expected ':' in ternary operator`
- **Cause:** An apostrophe inside a string template/expression broke parsing (e.g. `Today\'s mission`)
- **Fix:** Escaped/rewrote the string so the ternary/template parses correctly

## 6) Timezone bug: date showed “tomorrow” late at night
- **Symptom:** Local time showed Fri Jan 23 ~23:14 CST, but the app loaded as Jan 24
- **Cause:** `getDateKey()` used `toISOString()` (UTC) to compute `YYYY-MM-DD`, which can roll dates forward relative to local time
- **Fix:** Changed `getDateKey()` to construct the date key from local components (`getFullYear()`, `getMonth() + 1`, `getDate()`)

## 7) Completed yesterday task appeared as not done today (auto-carry + date-key interaction)
- **Symptom:** A task completed “yesterday” reappeared as incomplete in Today after refresh
- **Cause:** Same root as the timezone key bug: tasks/toggles near midnight were saved under the wrong (UTC-shifted) day, so auto-carry operated on the wrong buckets
- **Fix:** Same `getDateKey()` local-time fix (carry/refresh behavior stabilizes afterward)