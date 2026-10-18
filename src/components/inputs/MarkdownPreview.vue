<template>
    <article class="markdown-preview pa-4 text--primary" v-html="renderedMarkdown" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

@Component
export default class MarkdownPreview extends Vue {
    @Prop({ type: String, required: true }) readonly source!: string
    @Prop({ type: String, required: true }) readonly sourceUrl!: string

    get renderedMarkdown(): string {
        const html = marked.parse(this.source, { async: false, gfm: true })
        const fragment = DOMPurify.sanitize(html, {
            USE_PROFILES: { html: true },
            FORBID_TAGS: ['style'],
            FORBID_ATTR: ['style'],
            RETURN_DOM_FRAGMENT: true,
        })

        const previewDocument = document.implementation.createHTMLDocument('')
        const base = previewDocument.createElement('base')
        base.href = this.sourceUrl
        previewDocument.head.appendChild(base)
        previewDocument.body.appendChild(fragment)

        previewDocument.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
            link.setAttribute('href', link.href)
            link.setAttribute('target', '_blank')
            link.setAttribute('rel', 'noopener noreferrer')
        })
        previewDocument.querySelectorAll<HTMLImageElement>('img[src]').forEach((image) => {
            image.setAttribute('src', image.src)
        })

        return previewDocument.body.innerHTML
    }
}
</script>

<style lang="scss" scoped>
.markdown-preview {
    width: 100%;
    height: calc(100vh - 48px);
    overflow: auto;
    overflow-wrap: anywhere;
    font-size: 16px;
    line-height: 1.6;

    ::v-deep {
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin-bottom: 16px;
            line-height: 1.3;
        }

        ul,
        ol {
            margin-bottom: 16px;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        pre {
            overflow-x: auto;
            padding: 16px;
            margin-bottom: 16px;
            background: var(--v-toolbar-base);
            border-radius: 4px;

            code {
                padding: 0;
                background: transparent;
                color: inherit;
            }
        }

        blockquote {
            border-left: 4px solid var(--v-primary-base);
            padding-left: 16px;
        }

        table {
            display: block;
            overflow-x: auto;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        th,
        td {
            border: 1px solid var(--v-secondary-base);
            padding: 8px 16px;
        }
    }
}
</style>
