<script lang="ts">
  import type { VfsNode, VfsNodeDir, VfsNodeFile } from './vfsStore';
  import { setOpenFile } from './vfsStore';

  export let node: VfsNodeDir;
  export let basePath: string = '';

  function onOpenFile(path: string, file: VfsNodeFile) {
    const content = file.text ?? (file.bytes ? `[binary ${file.bytes.length} bytes]` : '');
    setOpenFile(path, content);
  }

  function openFileAt(path: string, child: VfsNode) {
    if (child.type === 'file') onOpenFile(path, child);
  }
</script>

<style>
  .tree-item { cursor: pointer; }
</style>

{#each Object.keys(node.children).sort() as name}
  {#if node.children[name].type === 'dir'}
    <div class="ml-2">
      <div class="font-semibold">{name}</div>
      <svelte:self node={node.children[name]} basePath={`${basePath}${name}/`} />
    </div>
  {:else}
    <div class="ml-2 tree-item" on:click={() => openFileAt(`${basePath}${name}`, node.children[name])}>
      {name}
    </div>
  {/if}
{/each}


