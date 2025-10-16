import { unzipSync, strFromU8 } from 'fflate';
import type { VfsNodeDir, VfsNode, VfsNodeFile } from './vfsStore';

export function buildTreeFromZip(zipBytes: Uint8Array): VfsNodeDir {
  const files = unzipSync(zipBytes);
  const root: VfsNodeDir = { type: 'dir', name: '', children: {} };

  const addPath = (rawPath: string, content?: Uint8Array) => {

    if (!rawPath) return;
    const isDirectoryEntry = rawPath.endsWith('/');
    const parts = rawPath.split('/').filter(Boolean);
    if (parts.length === 0) return;
    let current: VfsNodeDir = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current.children) current.children = {};

      if (isLast) {
        if (isDirectoryEntry || !content) {
          const existing = current.children[part];
          if (!existing || existing.type !== 'dir') {
            current.children[part] = { type: 'dir', name: part, children: {} } as VfsNodeDir;
          }
        } else {
          const node: VfsNodeFile = { type: 'file', name: part };
          try {
            const text = strFromU8(content);
            node.text = text;
          } catch {
            node.bytes = content;
          }
          current.children[part] = node;
        }
      } else {
        const existing = current.children[part];
        if (!existing) {
          current.children[part] = { type: 'dir', name: part, children: {} } as VfsNodeDir;
        } else if (existing.type !== 'dir') {
          current.children[part] = { type: 'dir', name: part, children: {} } as VfsNodeDir;
        }
        current = current.children[part] as VfsNodeDir;
      }
    }
  };

  for (const name of Object.keys(files)) {
    addPath(name, files[name]);
  }

  const rootChildren = Object.values(root.children);
  if (rootChildren.length === 1 && rootChildren[0].type === 'dir') {
    return rootChildren[0] as VfsNodeDir;
  }
  return root;
}


