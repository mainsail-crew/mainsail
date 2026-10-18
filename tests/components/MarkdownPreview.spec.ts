// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import MarkdownPreview from '@/components/inputs/MarkdownPreview.vue'

function render(source: string) {
    const preview = new MarkdownPreview({
        propsData: {
            source,
            sourceUrl: 'http://printer.local/server/files/config/notes/notes.md',
        },
    })
    const container = document.createElement('div')
    container.innerHTML = preview.renderedMarkdown
    preview.$destroy()
    return container
}

describe('MarkdownPreview', () => {
    it('renders headings, formatting, lists, fenced code, tables and task lists', () => {
        const output = render(`# Printer notes

**Bold** and *italic* and ~~removed~~

- First
- Second

\`\`\`ini
[printer]
\`\`\`

| Part | Status |
| --- | --- |
| Belt | Checked |

- [x] Clean bed`)

        expect(output.querySelector('h1')?.textContent).toBe('Printer notes')
        expect(output.querySelector('strong')?.textContent).toBe('Bold')
        expect(output.querySelector('em')?.textContent).toBe('italic')
        expect(output.querySelector('del')?.textContent).toBe('removed')
        expect(output.querySelectorAll('li')).toHaveLength(3)
        expect(output.querySelector('pre code')?.textContent).toBe('[printer]\n')
        expect(output.querySelector('table td')?.textContent).toBe('Belt')
        expect(output.querySelector<HTMLInputElement>('input')?.disabled).toBe(true)
        expect(output.querySelector<HTMLInputElement>('input')?.checked).toBe(true)
    })

    it('resolves relative links and images against the Markdown file location', () => {
        const output = render('[Config](../printer.cfg)\n\n![Photo](images/bed.png)')
        const link = output.querySelector('a')
        expect(link?.getAttribute('href')).toBe('http://printer.local/server/files/config/printer.cfg')
        expect(link?.target).toBe('_blank')
        expect(link?.rel).toBe('noopener noreferrer')
        expect(output.querySelector('img')?.getAttribute('src')).toBe(
            'http://printer.local/server/files/config/notes/images/bed.png'
        )
    })

    it('preserves external links and handles empty or malformed Markdown', () => {
        expect(render('').innerHTML).toBe('')
        expect(render('[Docs](https://docs.mainsail.xyz)').querySelector('a')?.href).toBe('https://docs.mainsail.xyz/')
        expect(() => render('[Broken](http://[)\n\n**unfinished')).not.toThrow()
    })

    it('removes scripts, event handlers, unsafe URLs, frames and inline styles', () => {
        const output = render(`<script>alert(1)</script>
<img src="photo.png" onerror="alert(1)">
<a href="javascript:alert(1)">Bad link</a>
<iframe src="http://evil.example"></iframe>
<style>body { display: none }</style>
<p style="position:fixed">Text</p>

[Bad Markdown link](javascript:alert%281%29)`)

        expect(output.querySelector('script, iframe, style, [onerror], [style]')).toBeNull()
        expect(output.querySelectorAll('a[href]')).toHaveLength(0)
        expect(output.textContent).toContain('Text')
    })

    it('updates the preview when the source changes', () => {
        const preview = new MarkdownPreview({
            propsData: { source: '# Before', sourceUrl: 'http://printer.local/server/files/config/notes.md' },
        })
        expect(preview.renderedMarkdown).toContain('Before')
        Object.assign(preview.$props, { source: '# After' })
        expect(preview.renderedMarkdown).toContain('After')
        preview.$destroy()
    })
})
