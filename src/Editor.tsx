import * as vscode from 'vscode';
import ReactDOM from 'react-dom/client';
import { LanguageClient } from 'vscode-languageclient/node';
import { MonacoVscodeApiWrapper, type MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';
import type { EditorAppConfig } from 'monaco-languageclient/editorApp';
import { LanguageClientWrapper } from 'monaco-languageclient/lcwrapper';
import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
// import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';

export const createEditorAndLanguageClient = async () => {

    const codeUri = '/workspace/hello.go';

    // Monaco VSCode API configuration
    const vscodeApiConfig: MonacoVscodeApiConfig = {
        $type: 'extended',
            htmlContainer: document.getElementById('monaco-editor-root')!
        viewsConfig: {
            $type: 'EditorService'
        },
        userConfiguration: {
            json: JSON.stringify({
                'workbench.colorTheme': 'Default Dark Modern',
                'editor.wordBasedSuggestions': 'off'
            })
        },
        monacoWorkerFactory: configureDefaultWorkerFactory
    };

    // Language client configuration

    const goClientConfig: LanguageClientConfig = {
        languageId: 'go',
        connection: {
            options: {
                $type: 'WebSocketUrl',
                url: 'ws://localhost:30000/go-ls'
            }
        },
        clientOptions: {
            documentSelector: ['go'],
            workspaceFolder: {
                index: 0,
                name: 'workspace',
                uri: vscode.Uri.file('/workspace')
            },
            initializationOptions: {
                go: {
                    analyses: {
                        unusedparams: true
                    },
                    staticcheck: true
                }
            } 
        }
    };

    // editor app / monaco-editor configuration
    const editorAppConfig: EditorAppConfig = {
        codeResources: {
            original: {
                text: "add your github repository...",
                uri: codeUri
            },
            modified: {
                text: "add your github repository...",
                uri: codeUri
            }
        }
    };

    const root = ReactDOM.createRoot(document.getElementById('react-root')!);
    const App = () => {
        return (
            <div style={{ 'backgroundColor': '#1f1f1f' }} >
                <MonacoEditorReactComp
                    vscodeApiConfig={vscodeApiConfig}
                    editorAppConfig={editorAppConfig}
                    languageClientConfig={goClientConfig}
                    style={{ 'height': '500px', 'display': 'flex', 'overflow': 'hidden' }}
                    onError={(e) => {
                        console.error(e);
                    }} />
            </div>
        );
    };
    root.render(<App />);



    const apiWrapper = new MonacoVscodeApiWrapper(vscodeApiConfig);
await apiWrapper.start();

// 2) create LanguageClientWrapper  
const lcWrapper = new LanguageClientWrapper(goClientConfig);
await lcWrapper.start();

// 3) start the editor (e.g., EditorApp)  
const editorApp = new EditorApp({
  codeResources: {
    main: { uri: '/workspace/main.go', text: '// your Go code' }
  }
});
await editorApp.start(htmlContainer);
};

createEditorAndLanguageClient();