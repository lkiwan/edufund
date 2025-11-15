const fs = require('fs');
const path = require('path');

// Simple function to generate an HTML version that can be printed to PDF
function generateHTMLDocs() {
  const docs = [
    'COMPLETE_PLATFORM_DOCUMENTATION.md',
    'DEVELOPMENT_TIMELINE.md',
    'README.md'
  ];

  docs.forEach(docFile => {
    try {
      const mdContent = fs.readFileSync(docFile, 'utf8');
      const htmlContent = convertMarkdownToHTML(mdContent, docFile);

      const htmlFile = docFile.replace('.md', '.html');
      fs.writeFileSync(htmlFile, htmlContent);

      console.log(`✅ Generated: ${htmlFile}`);
      console.log(`   Open in browser and use Ctrl+P or Cmd+P to save as PDF`);
    } catch (err) {
      console.error(`❌ Error processing ${docFile}:`, err.message);
    }
  });

  console.log('\n📄 HTML files created! To generate PDFs:');
  console.log('1. Open each .html file in your browser');
  console.log('2. Press Ctrl+P (Windows) or Cmd+P (Mac)');
  console.log('3. Select "Save as PDF"');
  console.log('4. Save with the same filename but .pdf extension\n');
}

function convertMarkdownToHTML(markdown, filename) {
  // Basic markdown to HTML conversion
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr/>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');

  // Checkboxes
  html = html.replace(/- \[x\]/g, '<input type="checkbox" checked disabled>');
  html = html.replace(/- \[ \]/g, '<input type="checkbox" disabled>');

  // Wrap in paragraphs
  const lines = html.split('\n');
  html = lines.map(line => {
    if (line.trim() && !line.startsWith('<') && !line.match(/^[\s]*$/)) {
      return `<p>${line}</p>`;
    }
    return line;
  }).join('\n');

  const title = filename.replace('.md', '').replace(/_/g, ' ');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - EduFund Platform</title>
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }

    h1 {
      color: #10b981;
      border-bottom: 3px solid #10b981;
      padding-bottom: 10px;
      margin-top: 30px;
      page-break-before: always;
    }

    h1:first-of-type {
      page-break-before: auto;
    }

    h2 {
      color: #059669;
      border-bottom: 2px solid #d1fae5;
      padding-bottom: 8px;
      margin-top: 25px;
      page-break-after: avoid;
    }

    h3 {
      color: #047857;
      margin-top: 20px;
      page-break-after: avoid;
    }

    pre {
      background: #f3f4f6;
      border-left: 4px solid #10b981;
      padding: 15px;
      overflow-x: auto;
      border-radius: 5px;
      page-break-inside: avoid;
    }

    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    pre code {
      background: none;
      padding: 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }

    th {
      background: #10b981;
      color: white;
      font-weight: bold;
    }

    tr:nth-child(even) {
      background: #f9fafb;
    }

    ul, ol {
      margin: 15px 0;
      padding-left: 30px;
    }

    li {
      margin: 8px 0;
      line-height: 1.5;
    }

    a {
      color: #10b981;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 30px 0;
    }

    strong {
      color: #1f2937;
      font-weight: 600;
    }

    blockquote {
      border-left: 4px solid #10b981;
      padding-left: 20px;
      margin: 20px 0;
      color: #6b7280;
      font-style: italic;
      background: #f9fafb;
      padding: 15px 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      page-break-after: avoid;
    }

    .header h1 {
      border: none;
      margin: 0;
      font-size: 2.5em;
    }

    .header p {
      color: #6b7280;
      font-size: 1.1em;
      margin: 10px 0;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.9em;
      page-break-before: avoid;
    }

    input[type="checkbox"] {
      margin-right: 8px;
    }

    @media print {
      body {
        max-width: 100%;
      }

      a {
        color: #333;
        text-decoration: none;
      }

      a[href]:after {
        content: " (" attr(href) ")";
        font-size: 0.8em;
        color: #666;
      }

      h1, h2, h3 {
        page-break-after: avoid;
      }

      pre, table, img {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>EduFund Platform</h1>
    <p>${title}</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  ${html}

  <div class="footer">
    <p><strong>EduFund Platform</strong> - Educational Crowdfunding Platform</p>
    <p>Generated by Claude Code | Contact: omar.arhoune@gmail.com</p>
    <p>© 2025 All rights reserved</p>
  </div>
</body>
</html>
  `.trim();
}

// Run the generator
console.log('📝 Generating HTML documentation...\n');
generateHTMLDocs();
