import { writable } from 'svelte/store';

export const githubAccessToken = writable<string | null>(null);


