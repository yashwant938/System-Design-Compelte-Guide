import React from 'react';
import { ArrowUpRight, Clock, Cpu, Database, Globe, Layers } from 'lucide-react';
import {
  CORE_DESIGN_PATTERNS,
  DECISION_MATRICES,
  HTTP_AND_POWERS,
  LATENCY_LADDER,
} from '../data/practiceAndCheatsheets.js';
import { GOF_PATTERNS_23 } from '../data/gofPatterns23.js';
import { renderRichText } from '../utils/richText.jsx';

export default function CheatsheetsView({ onJumpToLesson }) {
  return (
    <div className="mx-auto max-w-[1320px] px-3 sm:px-5 py-6 space-y-5">
      {/* Header */}
      <div className="notebook-card p-5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-sage-strong dark:text-[#A9E49E]">
          ByteByteGo 101 + Staff Engineer Visual Quick-Reference
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold mt-0.5">
          Ultimate System Design <span className="term-highlight">Cheatsheets</span>
        </h1>
        <p className="text-xs sm:text-[13px] font-mono text-ink-muted dark:text-paper-ink/75 mt-1 max-w-3xl">
          Review 30 minutes before your Microsoft, Google, Amazon, or Meta loop: 45-minute pacing blueprints, latency numbers, napkin math shortcuts, &ldquo;When to Use What&rdquo; decision matrices, and all 23 GoF design patterns on one page.
        </p>
      </div>

      {/* 6 Core Recurring System Design Patterns (Hello Interview Framework) */}
      <div className="notebook-card p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-sage-strong dark:text-[#A9E49E]">
              Master These 6 Patterns → Solve 95% of All HLD Interviews
            </div>
            <h2 className="font-display text-lg font-bold">
              6 Core Distributed System Design Patterns
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CORE_DESIGN_PATTERNS.map((item) => (
            <div
              key={item.pattern}
              className="flex flex-col justify-between rounded-xl border border-ink/15 dark:border-ink-border bg-paper/75 dark:bg-ink-elevated/60 p-3.5 space-y-2"
            >
              <div className="space-y-1.5">
                <div className="font-display text-sm font-bold text-ink dark:text-paper-ink">
                  {item.pattern}
                </div>
                <div className="text-[11px] font-mono text-sage-strong dark:text-[#A9E49E]">
                  <strong>Triggers:</strong> {item.when}
                </div>
                <p className="text-[11px] font-mono text-ink-muted dark:text-paper-ink/80 leading-relaxed">
                  {renderRichText(item.toolkit)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onJumpToLesson?.(item.lessonId)}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-lavender-strong dark:text-[#C4B5FD] hover:underline pt-1"
              >
                Open Deep Dive <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 45-Min HLD & LLD Playbooks Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="notebook-card p-5 space-y-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <Clock className="h-5 w-5 text-sage-strong" /> 45-Minute HLD Interview Blueprint
          </div>
          <ol className="space-y-2 text-xs font-mono">
            {[
              ['0–5 min', 'Clarify Functional & Non-Functional Requirements (DAU, read/write ratio, latency SLA, CP vs AP).'],
              ['5–10 min', 'Back-of-the-Envelope Math (QPS, 3× Peak, 5-yr Storage, Egress Gbps) + Core REST/gRPC APIs & Schema.'],
              ['10–25 min', 'High-Level Architecture Blueprint (DNS → CDN → LB → Stateless Services → Cache → DB → Queue).'],
              ['25–40 min', 'Deep Dives on Top 2–3 Bottlenecks (Sharding key, Hot Keys, Quorum/Consensus, Fan-out, Outbox CDC).'],
              ['40–45 min', 'Failure Modes, Multi-Region DR, Observability (OTel/SLOs), Security/Multi-Tenancy & Trade-offs.'],
            ].map(([time, desc]) => (
              <li key={time} className="flex gap-3 rounded-xl border border-ink/10 dark:border-ink-border bg-paper dark:bg-ink-elevated/60 p-2.5">
                <span className="shrink-0 rounded-md bg-sage px-2 py-0.5 font-bold text-ink dark:bg-sage-dark dark:text-[#C9F2BE] h-fit">
                  {time}
                </span>
                <span className="text-ink/90 dark:text-paper-ink/85">{desc}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="notebook-card p-5 space-y-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <Cpu className="h-5 w-5 text-lavender-strong" /> 45-Minute LLD / Machine Coding Blueprint
          </div>
          <ol className="space-y-2 text-xs font-mono">
            {[
              ['0–5 min', 'Clarify Core Use Cases, Actors, Concurrency Expectations (multi-threaded?), and Out-of-Scope items.'],
              ['5–15 min', 'Identify Core Entities (Nouns), Enums, State Transitions, and Extensibility Seams (Interfaces).'],
              ['15–30 min', 'Write Clean Modular Code (SOLID, Strategy/State/Factory/Command) — keep repos in-memory behind DIP interfaces.'],
              ['30–40 min', 'Harden Concurrency & Edge Cases (Global Lock Ordering, Atomic CAS, TTL expiry, integer cents precision).'],
              ['40–45 min', 'Dry-Run Happy + Error Flows and demonstrate how a brand-new requirement plugs in cleanly (OCP!).'],
            ].map(([time, desc]) => (
              <li key={time} className="flex gap-3 rounded-xl border border-ink/10 dark:border-ink-border bg-paper dark:bg-ink-elevated/60 p-2.5">
                <span className="shrink-0 rounded-md bg-lavender px-2 py-0.5 font-bold text-lavender-strong dark:bg-lavender-dark dark:text-[#C4B5FD] h-fit">
                  {time}
                </span>
                <span className="text-ink/90 dark:text-paper-ink/85">{desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Latency Numbers Ladder + Powers of 2 & HTTP Codes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 notebook-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-periwinkle-strong" /> Latency Numbers Every Engineer Must Know
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-ink/20 dark:border-ink-border text-[10.5px] uppercase text-ink-muted">
                  <th className="py-2 pr-3">Operation</th>
                  <th className="py-2 pr-3">Latency</th>
                  <th className="py-2 pr-3">Relative</th>
                  <th className="py-2">System Design Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 dark:divide-ink-border">
                {LATENCY_LADDER.map((row) => (
                  <tr key={row.op}>
                    <td className="py-2 pr-3 font-semibold">{row.op}</td>
                    <td className="py-2 pr-3 font-bold text-sage-strong dark:text-[#A9E49E] whitespace-nowrap">{row.time}</td>
                    <td className="py-2 pr-3 text-ink-muted whitespace-nowrap">{row.scale}</td>
                    <td className="py-2 text-ink-muted dark:text-paper-ink/75">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="notebook-card p-5 space-y-2.5">
            <h2 className="font-display text-base font-bold">Powers of 2 &amp; Time Shortcuts</h2>
            <div className="space-y-1.5 text-xs font-mono">
              {HTTP_AND_POWERS.powers.map(([p, name, approx]) => (
                <div key={p} className="flex items-center justify-between rounded-lg bg-paper dark:bg-ink-elevated px-3 py-1.5 border border-ink/10 dark:border-ink-border">
                  <strong className="text-lavender-strong dark:text-[#C4B5FD]">{p}</strong>
                  <span>{name}</span>
                  <span className="text-ink-muted">{approx}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="notebook-card p-5 space-y-2.5">
            <h2 className="font-display text-base font-bold">Essential HTTP Status Codes</h2>
            <div className="space-y-1.5 text-xs font-mono">
              {HTTP_AND_POWERS.httpCodes.map(([code, desc]) => (
                <div key={code} className="rounded-lg bg-paper dark:bg-ink-elevated px-3 py-1.5 border border-ink/10 dark:border-ink-border">
                  <strong className="text-sage-strong dark:text-[#A9E49E]">{code}:</strong>{' '}
                  <span className="text-ink/85 dark:text-paper-ink/85">{renderRichText(desc)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* When to Use What Decision Matrices */}
      <div className="space-y-4">
        {DECISION_MATRICES.map((mat) => (
          <div key={mat.title} className="notebook-card p-5 space-y-3">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-sage-strong" /> {mat.title}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-ink/20 dark:border-ink-border text-[10.5px] uppercase text-ink-muted">
                    <th className="py-2 pr-4">Requirement / Access Pattern</th>
                    <th className="py-2 pr-4">Recommended Technology</th>
                    <th className="py-2">Key Interview Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 dark:divide-ink-border">
                  {mat.rows.map(([req, tech, note]) => (
                    <tr key={req}>
                      <td className="py-2.5 pr-4">{req}</td>
                      <td className="py-2.5 pr-4 font-bold text-ink dark:text-paper-ink">{tech}</td>
                      <td className="py-2.5 text-ink-muted dark:text-paper-ink/75">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* All 23 GoF Patterns Quick-Scan Grid */}
      <div className="notebook-card p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-lavender-strong" /> All 23 GoF Design Patterns — One-Glance Grid
          </h2>
          <button
            type="button"
            onClick={() => onJumpToLesson?.('lld-gof-patterns')}
            className="notebook-btn text-xs"
          >
            Open Interactive Code Explorer <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {GOF_PATTERNS_23.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-ink/15 dark:border-ink-border bg-paper/75 dark:bg-ink-elevated/60 p-3 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold">{p.name}</span>
                <span className="rounded-full bg-paper-card dark:bg-ink-card px-2 py-0.5 text-[9.5px] font-mono font-bold border border-ink/15 dark:border-ink-border">
                  {p.category}
                </span>
              </div>
              <p className="text-[11px] font-mono text-ink-muted dark:text-paper-ink/75 leading-snug">
                {renderRichText(p.intent)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
