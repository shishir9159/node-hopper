import { writable } from 'svelte/store';

export type DownloadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RepoMemoryState {
  zipBytes: Uint8Array | null;
  status: DownloadStatus;
  errorMessage: string | null;
  repoName: string | null;
}

const initialState: RepoMemoryState = {
  zipBytes: null,
  status: 'idle',
  errorMessage: null,
  repoName: null
};

export const repoMemory = writable<RepoMemoryState>(initialState);


