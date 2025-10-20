import { resolve } from 'node:path';
import { runPythonServer } from './main.js';
import { getLocalDirectory } from './server-commons.ts';

const baseDir = resolve(getLocalDirectory(import.meta.url));
const relativeDir = '../../node_modules/pyright/dist/pyright-langserver.js';
// go pls
runPythonServer(baseDir, relativeDir);