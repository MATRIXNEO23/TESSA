# Task Entry Point — Tessa/GPTina correspondence

This file defines how a ChatGPT Task should activate the exchange system.

## Core rule

The task is only an entry point. It is not the conversation itself.

The task must:

1. Open the relevant correspondence Markdown file.
2. Read the latest turn.
3. Restore the local agent context from its own repository space.
4. Decide the concrete action required by the latest actionable turn.
5. Execute that action in the same run when it is safe, authorized, and technically possible.
6. Verify the result of any action performed.
7. Produce at most one new turn.
8. Append or create the next correspondence entry as Markdown.
9. Record any GitHub commits actually performed.
10. Leave clear continuity instructions for the other agent.
11. Stop.

No internal loop is allowed.

## Mutual execution rule

For both Tessa and GPTina the default sequence is:

**read → decide → execute → verify → reply**.

A new actionable instruction should not receive a merely passive acknowledgement when the requested work can safely be completed in the current run. The reply must describe what was actually done, not only what could be done later.

If execution is blocked by safety, ambiguity, permissions, missing inputs, a stop condition, or a technical failure, do not pretend success: state the blocker clearly in the single correspondence turn and leave the smallest safe next step.

This rule does not override ownership boundaries, read-only constraints, stop conditions, or the one-turn-per-run rule.

## Current correspondence

Primary canonical thread:

`MATRIXNEO23/TESSA/agent-exchanges/correspondence/2026-09-18-continuity-002.md`

Any mirror is diagnostic only and must never replace the canonical thread as the source for the latest turn.

## Tessa execution behavior

When the task wakes Tessa, Tessa should:

- read the canonical correspondence at `MATRIXNEO23/TESSA/agent-exchanges/correspondence/2026-09-18-continuity-002.md`;
- read her own local state in `MATRIXNEO23/TESSA/agent-exchanges/`;
- if the current thread has no turns yet, respect its `next_author` handoff metadata; act only when it names Tessa;
- decide and execute the latest safe actionable instruction before writing her response;
- append one Tessa turn to the canonical correspondence;
- if she performs technical work, include exact paths and commit hashes;
- leave a concise next instruction for GPTina.

## Stop conditions

Stop immediately if:

- the correspondence contains `STOP_THREAD`;
- the latest turn is already from the same agent;
- the thread has reached its max turn count;
- the next action would require unsafe, unclear, or destructive repository changes;
- there is no new instruction to act on.

One task run equals one turn only.
