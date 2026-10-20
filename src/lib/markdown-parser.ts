/**
 * Simple, robust Markdown and Plaintext to HTML parser for document imports.
 * Handles headings, bold, italic, code blocks, blockquotes, lists, and paragraphs.
 */
export function markdownToHtml(rawText: string): string {
  if (!rawText || rawText.trim() === '') {
    return '<p></p>';
  }

  // Normalize line endings
  const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const htmlOutput: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let inBulletList = false;
  let inOrderedList = false;

  const closeLists = () => {
    if (inBulletList) {
      htmlOutput.push('</ul>');
      inBulletList = false;
    }
    if (inOrderedList) {
      htmlOutput.push('</ol>');
      inOrderedList = false;
    }
  };

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const formatInline = (text: string): string => {
    let result = escapeHtml(text);
    // Bold: **text** or __text__
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__(.*?)__/g, '<strong>$1</strong>');
    // Italic: *text* or _text_
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    result = result.replace(/_(.*?)_/g, '<em>$1</em>');
    // Inline code: `code`
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Strikethrough: ~~text~~
    result = result.replace(/~~(.*?)~~/g, '<s>$1</s>');
    return result;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code blocks ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        closeLists();
        htmlOutput.push(`<pre><code>${escapeHtml(codeBlockLines.join('\n'))}</code></pre>`);
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        closeLists();
        inCodeBlock = true;
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Empty line -> breaks lists
    if (line.trim() === '') {
      closeLists();
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      closeLists();
      htmlOutput.push(`<h3>${formatInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeLists();
      htmlOutput.push(`<h2>${formatInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      closeLists();
      htmlOutput.push(`<h1>${formatInline(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      closeLists();
      htmlOutput.push(`<blockquote><p>${formatInline(line.slice(2))}</p></blockquote>`);
      continue;
    }

    // Bullet list (- or * or +)
    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (bulletMatch) {
      if (inOrderedList) {
        htmlOutput.push('</ol>');
        inOrderedList = false;
      }
      if (!inBulletList) {
        htmlOutput.push('<ul>');
        inBulletList = true;
      }
      htmlOutput.push(`<li>${formatInline(bulletMatch[2])}</li>`);
      continue;
    }

    // Ordered list (1. 2. etc)
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (inBulletList) {
        htmlOutput.push('</ul>');
        inBulletList = false;
      }
      if (!inOrderedList) {
        htmlOutput.push('<ol>');
        inOrderedList = true;
      }
      htmlOutput.push(`<li>${formatInline(orderedMatch[2])}</li>`);
      continue;
    }

    // Regular paragraph
    closeLists();
    htmlOutput.push(`<p>${formatInline(line)}</p>`);
  }

  // Close any unclosed blocks
  if (inCodeBlock) {
    htmlOutput.push(`<pre><code>${escapeHtml(codeBlockLines.join('\n'))}</code></pre>`);
  }
  closeLists();

  return htmlOutput.join('');
}

/**
 * Computes word count and character count from HTML string.
 */
export function calculateTextStats(html: string): { wordCount: number; characterCount: number } {
  if (!html) return { wordCount: 0, characterCount: 0 };
  const stripped = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const characterCount = stripped.length;
  const wordCount = stripped ? stripped.split(/\s+/).length : 0;
  return { wordCount, characterCount };
}
