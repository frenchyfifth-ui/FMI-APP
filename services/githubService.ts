import { Octokit } from "@octokit/rest";
import { BufferItem, Artifact } from "../types";

// Configuration - In a real app, these should be in .env
// Users must provide VITE_GITHUB_TOKEN, VITE_REPO_OWNER, VITE_REPO_NAME
const GITHUB_TOKEN = typeof process !== 'undefined' && process.env ? process.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN : '';
const OWNER = typeof process !== 'undefined' && process.env ? process.env.VITE_REPO_OWNER || 'frenchyfifth-ui' : 'frenchyfifth-ui';
const REPO = typeof process !== 'undefined' && process.env ? process.env.VITE_REPO_NAME || 'FMI' : 'FMI';

let octokit: Octokit | null = null;

if (GITHUB_TOKEN) {
  octokit = new Octokit({ auth: GITHUB_TOKEN });
} else {
  console.warn("GitHub Token missing. App running in offline/mock mode.");
}

/**
 * Helper to force a browser download of a text file.
 * Valid substitute for "Committing" in offline mode.
 */
export const downloadLocally = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Commits a raw idea to the BUFFER_INPUTS directory.
 */
export const commitToBuffer = async (item: BufferItem): Promise<boolean> => {
  const date = new Date().toISOString().split('T')[0];
  const sanitizedSource = item.source.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const path = `BUFFER_INPUTS/${item.domain}/${date}_${sanitizedSource}_${item.id}.md`;
  const content = `# BUFFER INPUT: ${item.domain}\n\n**Source:** ${item.source}\n**Date:** ${date}\n\n## Content\n${item.content}`;

  if (!octokit) {
    console.log(`[MOCK COMMIT] Buffer item '${item.id}' saved to local state.`);
    return false; // Return false to indicate "Offline/Local"
  }

  try {
    await createOrUpdateFile(path, content, `buffer: ingest ${item.domain} input from ${item.source}`);
    return true;
  } catch (error) {
    console.error("GitHub Buffer Commit Failed:", error);
    return false;
  }
};

/**
 * Commits a completed artifact to the JOURNEY_LOGS directory.
 */
export const commitJourneyLog = async (artifact: Artifact): Promise<boolean> => {
  const date = new Date(artifact.timestamp).toISOString().split('T')[0];
  const sanitizedTitle = artifact.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const path = `JOURNEY_LOGS/${date}_${sanitizedTitle}.md`;

  const content = `# JOURNEY LOG: ${artifact.title}
  
**Date:** ${date}
**Mode:** ${artifact.mode}
**Type:** ${artifact.type}
**Status:** DONE (Observable, External, Boring)

## Description
${artifact.description}

## Artifact Location
${artifact.isExternal ? "(External System / Physical)" : "(See attached repo file)"}
`;

  if (!octokit) {
    console.log(`[MOCK COMMIT] Artifact '${artifact.title}' saved to local state.`);
    return false;
  }

  try {
    await createOrUpdateFile(path, content, `journey: log artifact ${artifact.title}`);
    return true;
  } catch (error) {
    console.error("GitHub Journey Log Failed:", error);
    return false;
  }
};

// Helper to handle SHA retrieval for updates (upsert logic)
async function createOrUpdateFile(path: string, content: string, message: string) {
  if (!octokit) return;

  let sha: string | undefined;

  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
    });
    if (!Array.isArray(data) && data.sha) {
      sha = data.sha;
    }
  } catch (e: any) {
    // If 404, file doesn't exist, which is fine for new creations
    if (e.status !== 404) throw e;
  }

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    content: btoa(unescape(encodeURIComponent(content))), // Base64 encoding handling unicode
    sha,
  });
}
