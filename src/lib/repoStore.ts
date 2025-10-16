import { writable } from 'svelte/store';

export type DownloadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RepoMemoryState {
  // Raw zip bytes kept in memory only
  zipBytes: Uint8Array | null;
  // Human-readable status
  status: DownloadStatus;
  // Error message if any
  errorMessage: string | null;
  // Name of the repository for reference (e.g., "owner/repo")
  repoName: string | null;
}

const initialState: RepoMemoryState = {
  zipBytes: null,
  status: 'idle',
  errorMessage: null,
  repoName: null
};

export const repoMemory = writable<RepoMemoryState>(initialState);


