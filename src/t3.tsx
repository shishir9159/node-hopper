// default monaco-editor imports
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

// utilities to override Monaco services
import { initialize } from '@codingame/monaco-vscode-api'
import getConfigurationServiceOverride, {
  updateUserConfiguration
} from '@codingame/monaco-vscode-configuration-service-override'

window.MonacoEnvironment = {
  getWorker: (_moduleId, _label) => new editorWorker()
}

// overriding Monaco service with VSCode
await initialize({
  ...getConfigurationServiceOverride()
})

// json config like in vscode settings.json
updateUserConfiguration(`{
    "editor.fontSize": 30,
    "editor.lineHeight": 30,
    "editor.fontFamily": "monospace",
    "editor.fontWeight": "bold",
    "editor.letterSpacing": 0,
}`)

// creating an editor with VSCode configuration
monaco.editor.create(document.getElementById('editor')!, {
  value: 'Editor with VSCode config and large bold fonts'
})