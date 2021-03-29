import { loadWASM } from 'onigasm' // peer dependency of 'monaco-textmate'
import { Registry } from 'monaco-textmate' // peer dependency
import { wireTmGrammars } from 'monaco-editor-textmate';
import * as monaco from 'monaco-editor';
// eslint-disable-next-line no-unused-vars
import * as monacoNamespace from 'monaco-editor';

export const LANGUAGE_MAP = {
    cfg: 'klipper-config',
    conf: 'klipper-config',
    sh: 'shell',
    log: 'plaintext',
    js: 'javascript'
};

let onigasmLoaded = false;

class MultiRegistry {
    registries = new Map();

    async loadGrammar(id) {
        if (!this.registries.has(id)) {
            this.registries.set(id,
                new Registry({
                    getGrammarDefinition: async () => {
                        return Promise.resolve({
                            format: 'json',
                            content: await (await fetch(`/grammars/${id.split('.').pop()}.tmLanguage.json`)).text()
                        })
                    }
                })
            );
        }
        return await this.registries.get(id).loadGrammar(id);
    }
}

/**
 *
 * @param {monacoNamespace} monaco
 */
export async function liftOff(monaco) {
    if (!onigasmLoaded) {
        await loadWASM(`/libs/onigasm.wasm`) // See https://www.npmjs.com/package/onigasm#light-it-up
        onigasmLoaded = true;
    }
    const registry = new MultiRegistry();

    const grammars = new Map();
    grammars.set('klipper-config', 'source.klipper-config');
    grammars.set('gcode', 'source.gcode');

    monaco.languages.register({ id: 'klipper-config' });
    monaco.languages.register({ id: 'gcode' });

    // monaco's built-in themes aren't powereful enough to handle TM tokens
    // https://github.com/Nishkalkashyap/monaco-vscode-textmate-theme-converter#monaco-vscode-textmate-theme-converter
    const theme = await (await fetch('/editor.theme.json')).json();
    monaco.editor.defineTheme('dark-converted', theme);
    monaco.editor.setTheme('dark-converted');

    /*var editor = monaco.editor.create(document.getElementById('container'), {
        value: [
            'html, body {',
            '    margin: 0;',
            '}'
        ].join('\n'),
        language: 'css', // this won't work out of the box, see below for more info,
        theme: 'vs-code-theme-converted' // very important, see comment above
    })*/

    await wireTmGrammars(monaco, registry, grammars)
}

/**
 *
 * @param {monaco} monaco
 */
export function inject(monaco) {
// Register a new language
    monaco.languages.register({id: 'gcode', extensions: ['gcode']});

// Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('gcode', {
        tokenizer: {
            root: [
                [/;.*/, "comment"],
                [/[GMgm][\d]+/, 'gm-commands'],
                [/[XYZIJxyzij]-?([\d]*\.[\d]+|[\d]+)/, 'movement'],
                [/[FEfe]-?([\d]*\.[\d]+|[\d]+)/, 'speeds'],
                [/^[A-Z_]+/, 'klipper-macros'],
                [/([A-Z_]+)=/, 'klipper-macros-parameter-name'],
            ],
        }
    });

    monaco.editor.defineTheme('gcode-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'gm-commands', foreground: '#005ca2', fontStyle: 'bold' },
            { token: 'movement', foreground: '#ff5c5c' },
            { token: 'speeds', foreground: '#ffa941' },
            { token: 'klipper-macros', foreground: '#85fcff' },
            { token: 'klipper-macros-parameter-name', foreground: '#00fbff' },
        ]
    });

// Register a completion item provider for the new language
    monaco.languages.registerCompletionItemProvider('gcode', {
        provideCompletionItems: () => {
            /*var suggestions = [{
                label: 'simpleText',
                kind: monaco.languages.CompletionItemKind.Text,
                insertText: 'simpleText'
            }, {
                label: 'testing',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'testing(${1:condition})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            }, {
                label: 'ifelse',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: [
                    'if (${1:condition}) {',
                    '\t$0',
                    '} else {',
                    '\t',
                    '}'
                ].join('\n'),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'If-Else Statement'
            }];*/
            return {suggestions: []};
        }
    });
}


liftOff(monaco);
