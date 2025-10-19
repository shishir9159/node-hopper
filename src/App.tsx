import { useState } from 'react'
import './App.css'
import * as vscode from 'vscode';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';
import type { EditorAppConfig } from 'monaco-languageclient/editorApp';
import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';

    const languageId = 'go';
    const code = 'add your github repository';
    const codeUri = '/workspace/hello.go';

    // Monaco VSCode API configuration
    const vscodeApiConfig: MonacoVscodeApiConfig = {

    // $type: OverallConfigType; //
    // viewsConfig: ViewsConfig,
    // serviceOverrides?: monaco.editor.IEditorOverrideServices;m
    // logLevel?: LogLevel | number;
    // workspaceConfig?: IWorkbenchConstructionOptions;
    // userConfiguration?: UserConfiguration;
    // envOptions?: EnvironmentOverride;
    // extensions?: ExtensionConfig[];
    // monacoWorkerFactory?: (logger?: Logger) => void;
    // advanced?: {
    //     enableExtHostWorker?: boolean;
    //     loadThemes?: boolean;
    //     enforceSemanticHighlighting?: boolean;
    // };


        $type: 'extended',
        viewsConfig: {
            $type: 'EditorService',
                // htmlContainer: HTMLElement;
                // openEditorFunc?: OpenEditor;
                // htmlAugmentationInstructions?: (htmlContainer: HTMLElement | null | undefined) => void;
                // viewsInitFunc?: () => Promise<void>;
        },
        userConfiguration: {
            json: JSON.stringify({
                // 'workbench.colorTheme': 'Default Dark Modern',
                'editor.wordBasedSuggestions': 'off'
            })
        },
        monacoWorkerFactory: configureDefaultWorkerFactory
    };

    // Language client configuration
    const languageClientConfig: LanguageClientConfig = {
        languageId,
        connection: {
            options: {
                $type: 'WebSocketUrl',
                url: 'ws://localhost:3000'
            }
        },
        clientOptions: {
            documentSelector: [languageId],
            workspaceFolder: {
                index: 0,
                name: 'workspace',
                uri: vscode.Uri.file('/workspace')
            }
        }
    };

    // editor app / monaco-editor configuration
    const editorAppConfig: EditorAppConfig = {
        codeResources: {
            original: {
                text: code,
                uri: codeUri
            },
            modified: {
                text: code,
                uri: codeUri
            }
        }
    };

    function App() {
        return (
            <div style={{ 'backgroundColor': '#1f1f1f' }} >
                <MonacoEditorReactComp
                    vscodeApiConfig={vscodeApiConfig}
                    editorAppConfig={editorAppConfig}
                    languageClientConfig={languageClientConfig}
                    style={{ 'height': '500px', 'display': 'flex', 'overflow': 'hidden' }}
                    onError={(e) => {
                        console.error(e);
                    }} />
            </div>
        );
    };

// function App() {
//   const [count, setCount] = useState(0)

//   // import Editor

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//         </a>
//         <a href="https://react.dev" target="_blank">
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// } 

export default App