import { loadWASM } from 'onigasm' // peer dependency of 'monaco-textmate'
import { Registry } from 'monaco-textmate' // peer dependency
import { wireTmGrammars } from 'monaco-editor-textmate'
import * as monacoNamespace from 'monaco-editor';

/**
 *
 * @param {monacoNamespace} monaco
 */
export async function liftOff(monaco) {
    await loadWASM(`../node_modules/onigasm/lib/onigasm.wasm`) // See https://www.npmjs.com/package/onigasm#light-it-up

    const registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
            console.log(scopeName);
            return {
                format: 'json',
                content: await (await fetch(`grammars/klipper-config.tmLanguage.json`)).text()
            }
        }
    })

    // map of monaco "language id's" to TextMate scopeNames
    const grammars = new Map()
    grammars.set('css', 'source.css')
    grammars.set('html', 'text.html.basic')
    grammars.set('typescript', 'source.ts')

    // monaco's built-in themes aren't powereful enough to handle TM tokens
    // https://github.com/Nishkalkashyap/monaco-vscode-textmate-theme-converter#monaco-vscode-textmate-theme-converter
    monaco.editor.defineTheme('vs-code-theme-converted', {
        // ... use `monaco-vscode-textmate-theme-converter` to convert vs code theme and pass the parsed object here
    });

    /*var editor = monaco.editor.create(document.getElementById('container'), {
        value: [
            'html, body {',
            '    margin: 0;',
            '}'
        ].join('\n'),
        language: 'css', // this won't work out of the box, see below for more info,
        theme: 'vs-code-theme-converted' // very important, see comment above
    })*/

    await wireTmGrammars(monaco, registry, grammars, editor)
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
