import * as vscode from 'vscode';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';
import type { EditorAppConfig } from 'monaco-languageclient/editorApp';
import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';

export const createEditorAndLanguageClient = async () => {

    const languageId = 'go';
    const code = 'add your github repository';
    const codeUri = '/workspace/hello.go';

    // Monaco VSCode API configuration
    const vscodeApiConfig: MonacoVscodeApiConfig = {
        $type: 'extended',
        viewsConfig: {
            $type: 'EditorService'
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

    const root = ReactDOM.createRoot(document.getElementById('react-root')!);
    const App = () => {
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
    root.render(<App />);
};

createEditorAndLanguageClient();