# BUFFER_INPUTS Staging Area

## Purpose
This directory acts as a **Quarantine Zone** for external inputs (Expert Modules, PDFs, Datasets, Ideas) before they are merged into the canonical `DOMAIN_*.md` files.

## Rules
1.  **Queue First:** New knowledge must be committed here first.
2.  **No Direct Merge:** Nothing moves from here to the root `DOMAIN_` files without Distillation.
3.  **Validation:** Inputs must be stripped of identity, philosophy, and fluff before promotion.
4.  **Structure:**
    - `BUFFER_INPUTS/<DOMAIN>/<SOURCE>/`

## Promotion Pipeline
1.  Input committed to Buffer.
2.  AI Agent (Distiller) extracts constraints & metrics.
3.  Review against `EXECUTION_KERNEL.md`.
4.  Promote to `DOMAIN_*.md` (Root).
