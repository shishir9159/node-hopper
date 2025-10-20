import { type RegisterLocalProcessExtensionResult } from '@codingame/monaco-vscode-api/extensions';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import type { MonacoVscodeApiWrapper } from 'monaco-languageclient/vscodeApiWrapper';
import ReactDOM from 'react-dom/client';
import * as vscode from 'vscode';
import { configureDebugging } from 'monaco-languageclient/debugger';
import { createGoAppConfig } from './config.ts';
// import { createPythonAppConfig } from './config.ts';

export const runPythonReact = async () => {

    // const appConfig = createPythonAppConfig();
    const appConfig = createGoAppConfig();
    const onVscodeApiInitDone = async (apiWrapper: MonacoVscodeApiWrapper) => {

        const result = apiWrapper.getExtensionRegisterResult('mlc-python-example') as RegisterLocalProcessExtensionResult;
        result.setAsDefaultApi();

        const initResult = apiWrapper.getExtensionRegisterResult('debugger-py-client') as RegisterLocalProcessExtensionResult | undefined;
        if (initResult !== undefined) {
            configureDebugging(await initResult.getApi(), appConfig.configParams);
        }

        await vscode.commands.executeCommand('workbench.view.explorer');
        await vscode.window.showTextDocument(appConfig.configParams.files.get('hello2.py')!.uri);
    };

    const root = ReactDOM.createRoot(document.getElementById('react-root')!);
    const App = () => {
        return (
            <div style={{ 'backgroundColor': '#383838ff' }} >
                <MonacoEditorReactComp
                    vscodeApiConfig={appConfig.vscodeApiConfig}
                    editorAppConfig={appConfig.editorAppConfig}
                    languageClientConfig={appConfig.languageClientConfig}
                    style={{ 'height': '100%', 'width': '100%' }}
                    onVscodeApiInitDone={onVscodeApiInitDone}
                    onError={(e) => {
                        console.error(e);
                    }} />
            </div>
        );
    };

    root.render(<App />);
};

runPythonReact();