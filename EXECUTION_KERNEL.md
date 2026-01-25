# EXECUTION_KERNEL
## Runtime Rules for Preventing Cognitive Deadlock

### Scope
This kernel defines non-negotiable execution rules for high-capacity cognitive systems operating under sustained abstraction load. Its sole purpose is to preserve liveness (progress) and prevent livelock (thinking without shipping).

This document is operational. It is not descriptive, therapeutic, or aspirational.

---

## Invariants (Must Always Hold)

1. **Execution > Ideation**
   - No new idea may enter active memory unless an artifact exits the system first.

2. **Single-Mode Operation**
   - The system operates in exactly one mode at any time.

3. **Observable Completion**
   - Work is not complete unless it produces an external, observable artifact.

4. **Human Baseline**
   - Biological maintenance is mandatory and preempts all other work.

Violation of any invariant constitutes a runtime error.

---

## Operating Modes

The system supports four modes:

- **THINK** — analysis, modeling, exploration
- **BUILD** — implementation, writing, construction
- **MAINTAIN** — cleanup, review, sustainment
- **HUMAN** — sleep, food, movement, social contact

### Mode Rules
- Only one mode may be active.
- Cross-mode actions are forbidden.
- Mode switches must be explicit.

---

## Backpressure Mechanism

### One-In / One-Out Rule
- The idea queue is bounded.
- A new idea is accepted only after one artifact is completed and externalized.

Accepted artifacts include:
- A committed file
- A published document
- A delivered task visible to others

---

## Definition of Done (Hard)

Every task must declare a DONE condition that is:
- **Observable** — visible outside the system
- **External** — exists beyond internal thought
- **Boring** — no longer emotionally or intellectually stimulating

If a task still feels exciting, DONE has not been met.

---

## Watchdog

A watchdog timer monitors execution.

```text
if (no_artifact_emitted > 72 hours):
    reduce_scope(50%)
    simplify_output()
```

This action is automatic and non-negotiable.

---

## Worldbuilding Constraint

Worlds, models, and simulations are:
- Test harnesses
- Documentation layers
- Emulators

They are not production. **Production is lived reality.**
