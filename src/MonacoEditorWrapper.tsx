import { useEffect, useState } from 'react';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';
import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';
import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
import type { EditorAppConfig } from 'monaco-languageclient/editorApp';

export default function MonacoEditorWrapper() {
  const [editorReady, setEditorReady] = useState(false);
  const [configs, setConfigs] = useState<{
    vscodeApiConfig?: MonacoVscodeApiConfig;
    languageClientConfig?: LanguageClientConfig;
    editorAppConfig?: EditorAppConfig;
  }>({});

  useEffect(() => {
    const createEditorAndLanguageClient = async () => {
      const languageId = 'mylang';
      const code = '// initial editor content';
      const codeUri = '/workspace/hello.mylang';

      const vscodeApiConfig: MonacoVscodeApiConfig = {
        $type: 'extended',
        viewsConfig: { $type: 'EditorService' },
        userConfiguration: {
          json: JSON.stringify({
            'workbench.colorTheme': 'Default Dark Modern',
            'editor.wordBasedSuggestions': 'off',
          }),
        },
        monacoWorkerFactory: configureDefaultWorkerFactory,
      };

      const languageClientConfig: LanguageClientConfig = {
        languageId,
        connection: {
          options: {
            $type: 'WebSocketUrl',
            url: 'ws://localhost:30000/myLangLS',
          },
        },
        clientOptions: {
          documentSelector: [languageId],
        },
      };

      const editorAppConfig: EditorAppConfig = {
        codeResources: {
          modified: {
            text: code,
            uri: codeUri,
          },
        },
      };

      // Once configs are ready, store them in React state
      setConfigs({
        vscodeApiConfig,
        languageClientConfig,
        editorAppConfig,
      });
      setEditorReady(true);
    };

    createEditorAndLanguageClient();
  }, []);

  if (!editorReady) return <div>Loading Monaco Editor...</div>;

  return (
    <div style={{ backgroundColor: '#1f1f1f', height: '100vh' }}>
      <MonacoEditorReactComp
        vscodeApiConfig={configs.vscodeApiConfig!}
        editorAppConfig={configs.editorAppConfig!}
        languageClientConfig={configs.languageClientConfig!}
        style={{ height: '100%' }}
        onError={(e) => console.error(e)}
      />
    </div>
  );
}
