import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CodeBlock({ snippets, title }) {
  const languages = Object.keys(snippets || {});
  const [activeLang, setActiveLang] = useState(languages[0] || 'java');
  const [copied, setCopied] = useState(false);

  if (!languages.length) return null;

  const currentLang = languages.includes(activeLang) ? activeLang : languages[0];
  const code = snippets[currentLang] || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked in restricted contexts
    }
  };

  return (
    <div className="rounded-xl border border-ink/20 dark:border-ink-border bg-[#1B1917] text-[#F2EDE4] overflow-hidden">
      {title && (
        <div className="px-3.5 py-1.5 border-b border-white/10 bg-[#110F0D] text-[11px] font-mono uppercase tracking-wider text-amber-300/90 truncate">
          {String(title).replace(/`/g, '')}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10 bg-[#141210]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {languages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase transition-colors ${
                currentLang === lang
                  ? 'bg-sage text-ink'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-white/10'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1 text-[11px] font-mono text-stone-300 hover:bg-white/10"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-[12px] leading-relaxed font-mono overflow-x-auto max-h-[520px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
