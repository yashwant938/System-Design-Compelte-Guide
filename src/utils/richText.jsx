import React from 'react';

function renderCodeAndItalic(text, keyPrefix = '') {
  const input = String(text || '');
  const regex = /(`[^`]+`|\*[^*\s][^*]*\*)/g;
  const parts = input.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={`${keyPrefix}-c-${i}`}
          className="rounded-md border border-ink/15 bg-paper-subtle/90 px-1.5 py-0.5 text-[0.92em] font-mono font-semibold text-ink dark:border-ink-border dark:bg-ink-elevated dark:text-[#E8DFCE]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={`${keyPrefix}-e-${i}`} className="italic text-ink dark:text-paper-ink">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>;
  });
}

// Clean inline markdown renderer supporting **highlight** (even with nested `code`!), `code`, and *italic*
export function renderRichText(text) {
  const input = String(text || '');
  const parts = input.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={`b-${i}`} className="term-highlight">
          {renderCodeAndItalic(part.slice(2, -2), `b-${i}`)}
        </span>
      );
    }
    return <React.Fragment key={`p-${i}`}>{renderCodeAndItalic(part, `p-${i}`)}</React.Fragment>;
  });
}
