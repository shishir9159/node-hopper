import { writable, derived } from 'svelte/store';

export interface VfsNodeDir {
  type: 'dir';
  name: string;
  children: Record<string, VfsNode>;
}

export interface VfsNodeFile {
  type: 'file';
  name: string;
  // UTF-8 decoded text content; for binary we keep bytes
  text?: string;
  bytes?: Uint8Array;
}

export type VfsNode = VfsNodeDir | VfsNodeFile;

export interface VfsState {
  root: VfsNodeDir;
  openFilePath: string | null;
}

function emptyRoot(): VfsNodeDir {
  return { type: 'dir', name: '', children: {} };
}

const initialState: VfsState = { root: emptyRoot(), openFilePath: null };

export const vfs = writable<VfsState>(initialState);

export const openFile = writable<{ path: string | null; content: string | null }>({ path: null, content: null });

export function setTree(newRoot: VfsNodeDir) {
  vfs.update((s) => ({ ...s, root: newRoot }));
}

export function setOpenFile(path: string | null, content: string | null) {
  openFile.set({ path, content });
  vfs.update((s) => ({ ...s, openFilePath: path }));
}


