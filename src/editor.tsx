// import * as vscode from 'vscode';
// // Import Monaco Language Client components
// import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';
// import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';
// import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
// import type { EditorAppConfig } from 'monaco-languageclient/editorApp';
// import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
// import React from 'react';
// import ReactDOM from 'react-dom/client';

// export const createEditorAndLanguageClient = async () => {
//     const languageId = 'mylang';
//     const code = '// initial editor content';
//     const codeUri = '/workspace/hello.mylang';

//     // Monaco VSCode API configuration
//     const vscodeApiConfig: MonacoVscodeApiConfig = {
//         $type: 'extended',
//         viewsConfig: {
//             $type: 'EditorService'
//         },
//         userConfiguration: {
//             json: JSON.stringify({
//                 'workbench.colorTheme': 'Default Dark Modern',
//                 'editor.wordBasedSuggestions': 'off'
//             })
//         },
//         monacoWorkerFactory: configureDefaultWorkerFactory
//     };

//     // Language client configuration
//     const languageClientConfig: LanguageClientConfig = {
//         languageId,
//         connection: {
//             options: {
//                 $type: 'WebSocketUrl',
//                 // at this url the language server for myLang must be reachable
//                 url: 'ws://localhost:30000/myLangLS'
//             }
//         },
//         clientOptions: {
//             documentSelector: [languageId],
//             workspaceFolder: {
//                 index: 0,
//                 name: 'workspace',
//                 uri: vscode.Uri.file('/workspace')
//             }
//         }
//     };

//     // editor app / monaco-editor configuration
//     const editorAppConfig: EditorAppConfig = {
//         codeResources: {

//             main: {
//                 text: code,
//                 uri: codeUri
//             }
//         }
//     };

//     const root = ReactDOM.createRoot(document.getElementById('react-root')!);
//     const App = () => {
//         return (
//             <div style={{ 'backgroundColor': '#1f1f1f' }} >
//                 <MonacoEditorReactComp
//                     vscodeApiConfig={vscodeApiConfig}
//                     editorAppConfig={editorAppConfig}
//                     languageClientConfig={languageClientConfig}
//                     style={{ 'height': '100%' }}
//                     onError={(e) => {
//                         console.error(e);
//                     }} />
//             </div>
//         );
//     };
//     root.render(<App />);
// };
// createEditorAndLanguageClient();