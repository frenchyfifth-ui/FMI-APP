# Prompt Library (Google Studio Agents)

This directory contains the canonical system prompts for AI agents operating within the FMI Execution Kernel.

## Usage
These prompts are designed to be used in **Google Studio** or compatible LLM interfaces to enforce repository conventions and execution discipline.

## Agent Roster

1.  **[FOUNDATION_PIPELINE_AGENT](./FOUNDATION_PIPELINE_AGENT.md)** - The Meta-Agent orchestrating the full lifecycle.
2.  **[GOVERNANCE_AGENT](./GOVERNANCE_AGENT.md)** - Enforces repo structure and naming.
3.  **[INPUT_BUFFER_AGENT](./INPUT_BUFFER_AGENT.md)** - Ingests external expert knowledge securely.
4.  **[EXECUTION_KERNEL_AGENT](./EXECUTION_KERNEL_AGENT.md)** - Validates "Definition of Done".
5.  **[JOURNEY_LOGGER_AGENT](./JOURNEY_LOGGER_AGENT.md)** - Maintains the audit trail.
6.  **[PROMPT_DISTILLER_AGENT](./PROMPT_DISTILLER_AGENT.md)** - Converts noise into executable prompts.
7.  **[CROSS_LINKER_AGENT](./CROSS_LINKER_AGENT.md)** - Ensures governance spine connectivity.
