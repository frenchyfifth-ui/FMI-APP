# 🌐 Studio Master Workflow Prompt — Stage 01 Foundation Pipeline

## Purpose
This prompt orchestrates all six agents in sequence to process a **single new input** (expert repo, idea, or concept), validate it against governance, propagate it through the Mascarene Refuge S01 foundation pipeline, and produce ready-to-commit outputs. Outputs include markdown files, CI configs, logs, and journey metadata. Each step must produce feedback accessible for review before committing.

## Input
- `NEW_INPUT`: URL, repo, or text content to integrate (string)
- `TYPE`: one of ["expert_repo", "idea", "concept"] (string)
- Optional `TARGET_REPO`: repository to stage outputs (default: frenchyfifth-ui/FMI)
- Optional `TARGET_APP_REPO`: TypeScript/HTML app repo (default: FMI-APP)

## Workflow Agents

### Agent 1 — Intake & Metadata Collector
**Role:** Scan `NEW_INPUT`, extract metadata, tags, key files, and potential integration points.
**Output:**
- repo_name / content_id
- summary of purpose, scope, constraints
- dependency/overlap list
- suggested folder placement

### Agent 2 — Governance & Safety Validator
**Role:** Validate against:
- EXECUTION_KERNEL.md rules (one-mode, hard done, execution first)
- CC BY-SA 4.0 licensing
- Content safety (PII, clinical/diagnostic claims, conspiratorial/trigger wording)
- Stage-01 scope adherence (no operational/policy content)
**Output:** Pass/fail report, flagged lines, recommended edits.

### Agent 3 — System Integration Planner
**Role:** Map input content to the S01 structure:
- 00_context
- 01_hypothesis
- 02_system_layers (ecology, energy, finance, human, AI)
- 03_ai_orchestration
- 04_validation
- 99_appendix
- expert folders (e.g., expert_finance)
- journey logs and prompt library
**Output:** Proposed folder + filename list, cross-links, suggested references.

### Agent 4 — Artifact Generator
**Role:** Generate commit-ready files:
- Markdown files with headers, content, links
- README updates with one-line EXECUTION_KERNEL.md reference
- CI workflow yml (for FMI-APP or relevant apps)
- Optional .txt variant of EXECUTION_KERNEL.md
- Journey logs (report.md, summary.json)
- Tag outputs with source and timestamp
**Output:** File contents mapped to path

### Agent 5 — Feedback Logger
**Role:** At each step, produce a feedback log:
- What changes were applied
- What decisions were made
- Highlight any deviations from kernel / governance
- Store in `journey_logs/` with report.md and summary.json

### Agent 6 — Validation & Ready-to-Commit Checker
**Role:** Final QA before committing:
- Syntax checks (markdown, TypeScript, YAML)
- Lint / typecheck / build instructions verified for CI
- Ensure all governance rules enforced
- Output `READY_TO_COMMIT` = true/false
- Output diff summary ready for PR review

---

## Master Instructions

1. **Start** with `NEW_INPUT` and collect metadata (Agent 1).
2. **Validate** all content for governance and safety (Agent 2). Flag items for human review if needed.
3. **Plan integration** into S01 structure and expert folders (Agent 3).
4. **Generate artifacts** commit-ready (Agent 4).
5. **Log feedback** and decisions at each step (Agent 5).
6. **Validate readiness** for commit (Agent 6).

---

## Output Requirements

- `report.md`: complete markdown report of the workflow
- `summary.json`: JSON metadata including input info, files generated, governance checks, READY_TO_COMMIT flag, and timestamps
- `file_outputs/`: folder structure with all commit-ready files
- Human review highlights: flagged content, decisions needing verification
