# Yesterday/Today - Design Document

## The Job to Be Done

Help knowledge workers bridge the gap between reflection and execution by creating a daily practice where:
- They can see what they actually accomplished (Yesterday)
- They can clarify what they're aiming for today (Today)
- Unfinished work naturally flows forward, preventing tasks from silently disappearing
- They develop a pattern of continuous learning through daily check-ins

---

## Core Story: The Daily Ritual

### Monday Morning
Sarah opens the app. It automatically loads today (Monday) and yesterday (Sunday). She sees three tasks from Sunday that she didn't finish:
- Review team's deployment logs
- Write API documentation
- Update project timeline

She thinks about her mission for Monday: "Launch feature flags for A/B testing and stabilize performance."

### During Monday
As she works, she completes some tasks and adds new ones. By end of day, she checks off what she got done and writes a quick check-in: "Got feature flags deployed. Found a memory leak we need to fix tomorrow."

### Tuesday Morning
Sarah hasn't reloaded the app in 2 days (Monday and Tuesday were busy). When she opens it now on Wednesday, the app automatically carried forward:
- Sunday's incomplete tasks flowed to Monday
- Monday's incomplete tasks flowed to Tuesday  
- Tuesday's incomplete tasks flow to Wednesday

She sees her accumulated unfinished work and yesterday's check-in reminder. She can now decide: What still matters? What should I carry forward? What should I drop?

### The Pattern Emerges
Over weeks, Sarah realizes:
- Tasks that matter stay visible - they won't hide
- She can see patterns in what slips ("documentation always carries over")
- Her check-in history becomes a learning log ("when I skip the mission, things get chaotic")
- The visual flow prevents overwhelm by grouping completed work separately

---

## User Scenarios

### Scenario 1: The Daily Worker
**Person:** Someone who opens the app every day

**Workflow:**
1. Opens app, sees yesterday's tasks and today's
2. Sets mission for today
3. Adds/manages tasks throughout the day
4. Marks done what got done
5. Writes check-in at end of day
6. Goes to bed knowing unfinished work will be there tomorrow

**What matters:** Speed, clarity, quick feedback loops

---

### Scenario 2: The Interrupted Worker
**Person:** Someone whose day gets fragmented by meetings and context switches

**Workflow:**
1. Set mission in morning
2. Get pulled into meeting, open app hours later
3. Add tasks that came up during the day
4. Reorder by urgency/priority
5. End day with partial progress
6. Next day: see what matters most from yesterday

**What matters:** Ability to reorder, seeing priority, not losing context

---

### Scenario 3: The Absent Returner
**Person:** Someone who takes vacation, gets sick, or has a week of back-to-back meetings

**Workflow:**
1. Haven't opened app for 5 days
2. Open it on day 6
3. See all unfinished work automatically carried forward
4. Assess what still matters vs what fell off priorities
5. Clear out what no longer needs doing
6. Commit to tomorrow's mission

**What matters:** Automatic carry-forward (not manual), ability to bulk-clear, seeing the full history

---

### Scenario 4: The Reflective Team Lead
**Person:** Someone who uses check-ins to track team dynamics or their own leadership growth

**Workflow:**
1. Each day: brief mission
2. Each evening: check-in on "how did today go?"
3. Weekly review of check-in patterns
4. Use patterns to adjust team practices

**What matters:** Historical data, ability to see patterns, sense of continuity

---

## Core Principles

### Tasks Should Never Silently Disappear
If you don't finish something, it stays in your view until you explicitly complete or delete it. No setting things aside and forgetting.

### Yesterday Informs Today
You can see what you said you'd do (yesterday's mission) and what actually happened (check-in). This creates accountability to yourself.

### Completion is Binary, Not Guilt
Completed work is visually separated (collapsed) so it doesn't clutter but remains available. You can see that you DID do things.

### Work Carries Automatically, But You're in Control
The app doesn't harass you. It quietly carries forward incomplete tasks. But you decide what to accept, what to reschedule, what to drop.

### Patterns Over Perfection
The check-in history and carry count ("This task has been here 5 days") help you see patterns in your work. Not to shame you, but to learn.

---

## Features Organized by Workflow

### Morning Ritual
- [ ] See yesterday at a glance
- [ ] See yesterday's check-in and mission
- [ ] Review yesterday's unfinished work
- [ ] Set today's mission
- [ ] See what was auto-carried forward

### Throughout the Day
- [ ] Add new tasks
- [ ] Reorder by priority
- [ ] Mark tasks complete as you go
- [ ] Edit task wording if you need clarity
- [ ] Delete tasks that no longer apply

### End of Day
- [ ] See how many tasks you completed
- [ ] Write today's check-in
- [ ] Review what didn't get done (will carry to tomorrow)
- [ ] Optionally jump back to note something from yesterday

### Absence Handling (Multi-day gap)
- [ ] Auto-carry incomplete work through all missing days
- [ ] See full chain of history when you return
- [ ] Bulk actions to clear/reset as needed

### Reflection & Learning
- [ ] See task history (how many days it's been)
- [ ] Read past check-ins
- [ ] Notice patterns in what carries over

---

## Current Capabilities vs. Opportunities

### ✅ Currently Implemented
- Daily view of yesterday/today
- Task management (create, edit, delete, toggle)
- Auto-carry on date forward
- Multi-day auto-carry on page reload
- Mission with timestamp
- Daily check-in
- Task grouping (done/not done)
- Reordering
- Carry count tracking
- Manual carry from yesterday
- Feedback system

### 🤔 Opportunities for Iteration

#### Clarity & Navigation
- [ ] Could "Yesterday" be presented differently to emphasize learning vs. carrying?
- [ ] Should we surface the check-in more prominently as a learning artifact?
- [ ] Could we add week/month views to see patterns?

#### Task Intelligence
- [ ] Should tasks have due dates or time estimates?
- [ ] Could we show which tasks are "serial" (must do before others)?
- [ ] Should we highlight tasks that keep carrying (chronic incompleteness)?

#### Mission Intelligence
- [ ] Should mission cascade be optional or always happen?
- [ ] Could we track "mission completion" separately from task completion?
- [ ] Should we show past missions to see if we're repeating the same ones?

#### Check-in Evolution
- [ ] Could check-ins be structured (what went well / what got in the way)?
- [ ] Should we prompt at end of day if check-in is missing?
- [ ] Could check-in history be searchable?

#### Decision Making
- [ ] When returning after days away, should we help prioritize what to keep vs. drop?
- [ ] Could we suggest tasks to delete based on age and lack of progress?
- [ ] Should completed task history be visible to build confidence?

#### Social/Team Features
- [ ] Could this work for pairs or small teams?
- [ ] Should check-ins be shareable for accountability?
- [ ] Could we see others' missions to coordinate?

#### Data & Insight
- [ ] Should we track metrics (tasks per day, completion rate)?
- [ ] Could we show "average days before completion" per task type?
- [ ] Should we identify "blockers" from check-in text?

---

## Open Questions

1. **Is the "mission" about execution clarity or aspirational direction?**
   - Currently: Feels like clarifying what matters today
   - Question: Should it evolve during the day or stay fixed?

2. **What does "done" mean?**
   - Currently: User marks it complete
   - Question: Should we validate it's really done? Do check-ins confirm?

3. **When should tasks be deleted vs. carried?**
   - Currently: User decides
   - Question: Should old tasks auto-age out? Should we warn about 7-day-old tasks?

4. **Is this personal or team?**
   - Currently: Solo work tool
   - Question: Would sharing (not editing, just visibility) change the value?

5. **How do we prevent this from becoming a shame tool?**
   - Currently: Completed tasks are visually de-emphasized
   - Question: Should we celebrate completions? Show streaks?

---

## Design Iteration Notes

*Add reflections, sketches, and discussions here as we iterate on the design.*

---
