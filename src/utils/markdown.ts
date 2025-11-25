const convertTables = (input: string) => {
  return input.replace(
    /^\|(.+)\|\n\|([-:| ]+)\|\n((\|.*\|\n?)*)/gm,
    (_, headerLine, alignLine, rows) => {
      const headers = headerLine.split('|').map((h) => h.trim()).filter(Boolean);
      const rowLines = rows.split('\n').map(r => r.split('|').map(c => c.trim()).filter(Boolean)).filter(Boolean);

      const ths = headers.map(h => `<view class="table-th">${h}</view>`).join('');
      const trs = rowLines.map(cols => `<view class="table-row">${cols.map(c => `<view class="table-td">${c}</view>`).join('')}</view>`).join('');

      return `<view class="table"><view class="table-header">${ths}</view><view class="table-body">${trs}</view></view>`;
    }
  );
};
const convertCharts = (input: string) =>
  input.replace(/```(linechart|barchart)\n([\s\S]*?)```/g, (_, type, content) => {
    // content 可以是 JSON 数据或者 CSV 风格数据
    return `<chart type="${type}" data='${JSON.stringify(content.trim())}'></chart>`;
  });

const convertHr = (input: string) => {
  return input.replace(/^([-*]){3,}\s*$/gm, '<view class="hr"></view>');
};
const convertMermaid = (input: string) =>
  input.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    return `<view class="mermaid-block"><text>${code.trim()}</text></view>`;
  });

const escapeHtml = (input = '') =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const wrapParagraphs = (input: string) => {
  const blocks = input
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const blockTags = ['<pre', '<ul', '<ol', '<h', '<blockquote'];

  return blocks
    .map((block) => {
      if (blockTags.some((tag) => block.startsWith(tag))) {
        return block;
      }
      return `<p>${block}</p>`;
    })
    .join('');
};

const convertCodeBlocks = (input: string) =>
  input.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang = 'text', code) => {
    const safe = escapeHtml(code.trim());
    return `<pre class="md-code"><code class="language-${lang}">${safe}</code></pre>`;
  });

const convertBlockQuotes = (input: string) =>
  input.replace(/(^|\n)>\s?(.*)/g, (_, prefix, content) => {
    const body = content.replace(/\n>/g, '\n');
    return `${prefix}<blockquote>${body.trim()}</blockquote>`;
  });

const buildList = (match: string, ordered = false) => {
  const items = match
    .trim()
    .split('\n')
    .map((line) =>
      line
        .replace(ordered ? /^\d+\.\s+/ : /^[-*+]\s+/, '')
        .trim()
    )
    .map((line) => `<li>${line}</li>`)
    .join('');

  return ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
};

const convertLists = (input: string) => {
  const unordered = input.replace(
    /(^|\n)([-*+]\s+.+)(\n[-*+]\s+.+)+/g,
    (match) => buildList(match, false)
  );

  return unordered.replace(
    /(^|\n)(\d+\.\s+.+)(\n\d+\.\s+.+)+/g,
    (match) => buildList(match, true)
  );
};

const convertHeadings = (input: string) =>
  input.replace(/^(#{1,6})\s?(.*)$/gm, (_, hashes, text) => {
    const level = hashes.length;
    return `<h${level}>${text.trim()}</h${level}>`;
  });

const convertInline = (input: string) =>
  input
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<image alt="$1" src="$2" mode="widthFix" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

export function renderMarkdown(rawContent?: string) {
  if (!rawContent) return '';

  let output = rawContent.replace(/\r\n/g, '\n');

  output = convertCodeBlocks(output);
  output = convertMermaid(output);
  output = convertBlockQuotes(output);
  output = convertTables(output);
  output = convertLists(output);
  output = convertHeadings(output);
  output = convertInline(output);
  output = convertHr(output);
  output = output.replace(/\n/g, '<br/>');
  output = convertCharts(output);
  return wrapParagraphs(output);

}

