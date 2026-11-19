import React, { useMemo, useState } from 'react';
import { Maximize2, Minimize2, Pause, Play, RotateCcw } from 'lucide-react';

const TONE_MAP = {
  blue: {
    topLight: '#D1E2FA',
    sideLight: '#A8C7F0',
    topDark: '#233854',
    sideDark: '#1A2B42',
    strokeLight: '#1F1D1A',
    strokeDark: '#9BC0F5',
    dot: '#4A89DC',
  },
  green: {
    topLight: '#C2E8AE',
    sideLight: '#97D07B',
    topDark: '#244128',
    sideDark: '#1B311E',
    strokeLight: '#1F1D1A',
    strokeDark: '#9AD484',
    dot: '#3B9C52',
  },
  purple: {
    topLight: '#E4DCF8',
    sideLight: '#C5B5EC',
    topDark: '#33284D',
    sideDark: '#261D3B',
    strokeLight: '#1F1D1A',
    strokeDark: '#C4B5FD',
    dot: '#7C5CE6',
  },
  amber: {
    topLight: '#F7E3B5',
    sideLight: '#E5C379',
    topDark: '#47361B',
    sideDark: '#362813',
    strokeLight: '#1F1D1A',
    strokeDark: '#F2C97D',
    dot: '#D9822B',
  },
  coral: {
    topLight: '#FAD4CF',
    sideLight: '#EBAAA1',
    topDark: '#4A2623',
    sideDark: '#381B19',
    strokeLight: '#1F1D1A',
    strokeDark: '#F2A39A',
    dot: '#DC5B4B',
  },
  rose: {
    topLight: '#FAD4CF',
    sideLight: '#EBAAA1',
    topDark: '#4A2623',
    sideDark: '#381B19',
    strokeLight: '#1F1D1A',
    strokeDark: '#F2A39A',
    dot: '#DC5B4B',
  },
  slate: {
    topLight: '#E8E2D5',
    sideLight: '#CFC6B4',
    topDark: '#322D28',
    sideDark: '#26221E',
    strokeLight: '#1F1D1A',
    strokeDark: '#B8AFA3',
    dot: '#78716C',
  },
};

const HUD_STATUS_STYLE = {
  good: 'border-sage-strong/60 bg-sage/20 text-sage-text dark:border-sage/40 dark:bg-sage-dark/70 dark:text-[#A9E49E]',
  warn: 'border-sand-strong/50 bg-sand/30 text-[#92400E] dark:border-sand/40 dark:bg-sand-dark/80 dark:text-[#F5CF87]',
  bad: 'border-coral-strong/50 bg-coral/35 text-coral-strong dark:border-coral/40 dark:bg-coral-dark/80 dark:text-[#F7A89E]',
  info: 'border-ink/15 bg-paper-card text-ink dark:border-ink-border dark:bg-ink-elevated dark:text-paper-ink',
};

const BADGE_STYLE = {
  green: { bgL: '#D4F0C6', bgD: '#224227', textL: '#1B5E20', textD: '#A7E89E' },
  amber: { bgL: '#FCE8BE', bgD: '#4A3618', textL: '#92400E', textD: '#F8D08B' },
  rose: { bgL: '#FDDAD6', bgD: '#4C2220', textL: '#B91C1C', textD: '#FCA5A5' },
  coral: { bgL: '#FDDAD6', bgD: '#4C2220', textL: '#B91C1C', textD: '#FCA5A5' },
  blue: { bgL: '#DBEAFE', bgD: '#1E3452', textL: '#1E40AF', textD: '#93C5FD' },
  purple: { bgL: '#EDE9FE', bgD: '#322650', textL: '#5B21B6', textD: '#C4B5FD' },
};

function getTone(toneName) {
  return TONE_MAP[toneName] || TONE_MAP.blue;
}

function renderNodeShape(node, isDark) {
  const t = getTone(node.tone);
  const fillTop = isDark ? t.topDark : t.topLight;
  const fillSide = isDark ? t.sideDark : t.sideLight;
  const stroke = isDark ? t.strokeDark : t.strokeLight;
  const textMain = isDark ? '#F2EDE4' : '#1F1D1A';
  const textMuted = isDark ? '#B5ACA0' : '#5E584F';
  const opacity = node.dim ? 0.42 : 1;

  if (node.type === 'uml') {
    const fields = node.umlFields || [];
    const methods = node.umlMethods || [];
    const width = node.width || 176;
    const headerH = 30;
    const fieldsH = Math.max(22, fields.length * 14 + 10);
    const methodsH = Math.max(22, methods.length * 14 + 10);
    const totalH = headerH + fieldsH + methodsH;
    const left = -width / 2;
    const top = -totalH / 2;

    return (
      <g opacity={opacity}>
        <rect
          x={left + 3}
          y={top + 3}
          width={width}
          height={totalH}
          rx={9}
          fill={isDark ? '#0B0A08' : '#1F1D1A'}
          opacity={isDark ? 0.55 : 0.14}
        />
        <rect
          x={left}
          y={top}
          width={width}
          height={totalH}
          rx={9}
          fill={isDark ? '#23201C' : '#FCF9F2'}
          stroke={stroke}
          strokeWidth={1.5}
        />
        <path
          d={`M ${left + 9} ${top} H ${left + width - 9} Q ${left + width} ${top} ${left + width} ${top + 9} V ${top + headerH} H ${left} V ${top + 9} Q ${left} ${top} ${left + 9} ${top} Z`}
          fill={fillTop}
          stroke={stroke}
          strokeWidth={1.4}
        />
        <text
          x={0}
          y={top + 19}
          textAnchor="middle"
          fill={textMain}
          fontSize="11"
          fontWeight="700"
          fontFamily="Space Grotesk, sans-serif"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={0}
            y={top - 6}
            textAnchor="middle"
            fill={textMuted}
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            {node.sublabel}
          </text>
        )}
        <line x1={left} y1={top + headerH + fieldsH} x2={left + width} y2={top + headerH + fieldsH} stroke={stroke} strokeWidth={1} opacity={0.45} />
        {fields.map((f, idx) => (
          <text
            key={idx}
            x={left + 9}
            y={top + headerH + 14 + idx * 14}
            fill={textMuted}
            fontSize="9.2"
            fontFamily="JetBrains Mono, monospace"
          >
            {f}
          </text>
        ))}
        {methods.map((m, idx) => (
          <text
            key={idx}
            x={left + 9}
            y={top + headerH + fieldsH + 14 + idx * 14}
            fill={textMain}
            fontSize="9.2"
            fontWeight="500"
            fontFamily="JetBrains Mono, monospace"
          >
            {m}
          </text>
        ))}
      </g>
    );
  }

  if (node.type === 'db' || node.type === 'cache') {
    const rx = 28;
    const ry = 11;
    const h = 34;
    return (
      <g opacity={opacity}>
        {/* Ground shadow */}
        <ellipse cx={0} cy={h / 2 + 8} rx={rx + 3} ry={ry} fill="#000" opacity={isDark ? 0.35 : 0.08} />
        {/* Cylinder body */}
        <path
          d={`M ${-rx} ${-h / 2} V ${h / 2} A ${rx} ${ry} 0 0 0 ${rx} ${h / 2} V ${-h / 2} Z`}
          fill={fillSide}
          stroke={stroke}
          strokeWidth={1.5}
        />
        {/* Cylinder top */}
        <ellipse cx={0} cy={-h / 2} rx={rx} ry={ry} fill={fillTop} stroke={stroke} strokeWidth={1.5} />
        {/* Data stripes */}
        <path d={`M ${-rx + 7} ${-2} Q 0 ${6} ${rx - 7} ${-2}`} fill="none" stroke={stroke} strokeWidth={1.1} opacity={0.45} />
        <path d={`M ${-rx + 7} ${9} Q 0 ${17} ${rx - 7} ${9}`} fill="none" stroke={stroke} strokeWidth={1.1} opacity={0.45} />
        {/* Label underneath */}
        <text x={0} y={h / 2 + 23} textAnchor="middle" fill={textMain} fontSize="11" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
          {node.label}
        </text>
        {node.sublabel && (
          <text x={0} y={h / 2 + 36} textAnchor="middle" fill={textMuted} fontSize="9.5" fontFamily="JetBrains Mono, monospace">
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }

  if (node.type === 'queue') {
    return (
      <g opacity={opacity}>
        <polygon points="-38,8 0,-12 38,8 0,28" fill="#000" opacity={isDark ? 0.32 : 0.08} transform="translate(0, 10)" />
        {/* 3 stacked isometric message blocks */}
        {[-16, 0, 16].map((dx, i) => (
          <g key={i} transform={`translate(${dx}, ${-i * 3})`}>
            <polygon points="-14,-8 0,-15 14,-8 0,-1" fill={fillTop} stroke={stroke} strokeWidth={1.3} />
            <polygon points="-14,-8 0,-1 0,13 -14,6" fill={fillSide} stroke={stroke} strokeWidth={1.3} />
            <polygon points="14,-8 0,-1 0,13 14,6" fill={fillTop} stroke={stroke} strokeWidth={1.3} opacity={0.85} />
          </g>
        ))}
        <text x={0} y={32} textAnchor="middle" fill={textMain} fontSize="11" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
          {node.label}
        </text>
        {node.sublabel && (
          <text x={0} y={45} textAnchor="middle" fill={textMuted} fontSize="9.5" fontFamily="JetBrains Mono, monospace">
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }

  if (node.type === 'users' || node.type === 'client') {
    return (
      <g opacity={opacity}>
        {/* Isometric platform */}
        <polygon points="0,-24 44,0 0,24 -44,0" fill={fillTop} stroke={stroke} strokeWidth={1.4} />
        <polygon points="-44,0 0,24 0,31 -44,7" fill={fillSide} stroke={stroke} strokeWidth={1.3} />
        <polygon points="44,0 0,24 0,31 44,7" fill={fillSide} stroke={stroke} strokeWidth={1.3} opacity={0.85} />
        {/* Stylized person silhouettes */}
        {[-14, 0, 14].map((dx, idx) => (
          <g key={idx} transform={`translate(${dx}, ${idx === 1 ? -4 : 1})`}>
            <circle cx={0} cy={-6} r={3.6} fill={stroke} opacity={0.85} />
            <path d="M -5 4 C -5 -1 5 -1 5 4" fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
          </g>
        ))}
        <text x={0} y={46} textAnchor="middle" fill={textMain} fontSize="11.5" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
          {node.label}
        </text>
        {node.sublabel && (
          <text x={0} y={59} textAnchor="middle" fill={textMuted} fontSize="9.5" fontFamily="JetBrains Mono, monospace">
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }

  // Default 2.5D Isometric Hexagon (Origin / Service / Edge / Gateway / Load Balancer)
  const hexTop = '0,-32 32,-16 32,12 0,28 -32,12 -32,-16';
  const hexSideL = '-32,12 0,28 0,38 -32,22';
  const hexSideR = '32,12 0,28 0,38 32,22';

  return (
    <g opacity={opacity}>
      <polygon points="0,-24 34,-8 34,20 0,36 -34,20 -34,-8" fill="#000" opacity={isDark ? 0.35 : 0.08} transform="translate(0, 8)" />
      <polygon points={hexSideL} fill={fillSide} stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={hexSideR} fill={fillSide} stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" opacity={0.85} />
      <polygon points={hexTop} fill={fillTop} stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Small top emblem */}
      <circle cx={0} cy={-14} r={3.5} fill={stroke} opacity={0.65} />
      <text x={0} y={4} textAnchor="middle" fill={textMain} fontSize="11" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
        {node.label}
      </text>
      {node.sublabel && (
        <text x={0} y={17} textAnchor="middle" fill={textMuted} fontSize="9.2" fontFamily="JetBrains Mono, monospace">
          {node.sublabel}
        </text>
      )}
    </g>
  );
}

export default function IsometricStage({
  scene,
  isDark,
  paused,
  onTogglePause,
  replayNonce,
  onReplay,
  title,
}) {
  const [fullscreen, setFullscreen] = useState(false);

  const nodeMap = useMemo(() => {
    const map = {};
    (scene?.nodes || []).forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [scene]);

  if (!scene) return null;

  const gridStroke = isDark ? 'rgba(242, 237, 228, 0.06)' : 'rgba(31, 29, 26, 0.065)';
  const edgeBaseStroke = isDark ? 'rgba(242, 237, 228, 0.42)' : 'rgba(31, 29, 26, 0.55)';

  const stageBody = (
    <div
      className={`iso-stage-bg relative flex flex-col rounded-2xl border border-ink/20 dark:border-ink-border overflow-hidden ${
        fullscreen ? 'h-full w-full' : ''
      } ${paused ? 'paused-animations' : ''}`}
    >
      {/* Top Live Telemetry HUD Strip */}
      {scene.hud && scene.hud.length > 0 && (
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-b border-ink/10 dark:border-ink-border/70 bg-paper-card/85 dark:bg-ink-card/85 backdrop-blur-sm">
          {scene.hud.map((metric, idx) => (
            <div
              key={idx}
              className={`rounded-xl border px-2.5 py-2 transition-colors ${
                HUD_STATUS_STYLE[metric.status || 'info']
              }`}
            >
              <div className="text-[9.5px] font-mono uppercase tracking-wider opacity-75 truncate">
                {metric.label}
              </div>
              <div className="font-display text-sm sm:text-base font-bold leading-tight mt-0.5 truncate">
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Isometric SVG Canvas */}
      <div className={`relative w-full ${fullscreen ? 'flex-1 min-h-0' : 'aspect-[16/10] sm:aspect-[16/9] min-h-[300px]'}`}>
        <svg
          key={replayNonce}
          viewBox="0 0 760 420"
          className="w-full h-full select-none"
          role="img"
          aria-label={title || 'Interactive System Architecture Diagram'}
        >
          <defs>
            {/* Isometric Diamond Grid Pattern */}
            <pattern id="isoDiamondGrid" width="44" height="25.4" patternUnits="userSpaceOnUse">
              <path
                d="M 22 0 L 44 12.7 L 22 25.4 L 0 12.7 Z"
                fill="none"
                stroke={gridStroke}
                strokeWidth="0.85"
              />
            </pattern>
            <marker
              id="isoArrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={edgeBaseStroke} />
            </marker>
          </defs>

          {/* Subtle isometric grid background */}
          <rect x="0" y="0" width="760" height="420" fill="url(#isoDiamondGrid)" />

          {/* Edges + Animated Packet Dots */}
          {(scene.edges || []).map((edge, idx) => {
            const src = nodeMap[edge.from];
            const dst = nodeMap[edge.to];
            if (!src || !dst) return null;

            const mx = (src.x + dst.x) / 2;
            const my = (src.y + dst.y) / 2 + (edge.curve || 0);
            const pathD = `M ${src.x} ${src.y} Q ${mx} ${my} ${dst.x} ${dst.y}`;
            const pathId = `edge-path-${replayNonce}-${idx}`;
            const pTone = getTone(edge.packetColor || 'green');
            const speed = edge.speed || 2.4;
            const packetCount = edge.packetCount ?? 2;

            return (
              <g key={idx}>
                <path
                  id={pathId}
                  d={pathD}
                  fill="none"
                  stroke={edge.dashed ? pTone.dot : edgeBaseStroke}
                  strokeWidth={edge.dashed ? 1.8 : 1.7}
                  strokeDasharray={edge.dashed ? '6 5' : undefined}
                  markerEnd="url(#isoArrow)"
                  opacity={edge.dim ? 0.35 : 0.85}
                />

                {/* Animated packets */}
                {!paused &&
                  Array.from({ length: packetCount }).map((_, pIdx) => (
                    <circle
                      key={`f-${pIdx}`}
                      r="4.2"
                      fill={pTone.dot}
                      stroke={isDark ? '#161412' : '#FCF9F2'}
                      strokeWidth="1.2"
                    >
                      <animateMotion
                        dur={`${speed}s`}
                        begin={`${(pIdx * speed) / packetCount}s`}
                        repeatCount="indefinite"
                        path={pathD}
                      />
                    </circle>
                  ))}

                {/* Optional reverse return packets */}
                {!paused && edge.bidirectional && (
                  <circle
                    r="3.8"
                    fill={getTone('green').dot}
                    stroke={isDark ? '#161412' : '#FCF9F2'}
                    strokeWidth="1.2"
                  >
                    <animateMotion
                      dur={`${speed * 1.1}s`}
                      begin={`${speed * 0.45}s`}
                      repeatCount="indefinite"
                      keyPoints="1;0"
                      keyTimes="0;1"
                      calcMode="linear"
                      path={pathD}
                    />
                  </circle>
                )}

                {/* Edge Latency / Protocol Label Pill */}
                {edge.label && (
                  <g transform={`translate(${mx}, ${my - 9})`}>
                    <rect
                      x={-(edge.label.length * 3.1 + 10)}
                      y={-9}
                      width={edge.label.length * 6.2 + 20}
                      height={18}
                      rx={9}
                      fill={isDark ? '#201D19' : '#FCF9F2'}
                      stroke={isDark ? '#494238' : '#1F1D1A'}
                      strokeOpacity={0.28}
                      strokeWidth={1}
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill={isDark ? '#E4DDD2' : '#3C3730'}
                      fontSize="9.2"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {(scene.nodes || []).map((node) => {
            const bStyle = node.badgeTone ? BADGE_STYLE[node.badgeTone] || BADGE_STYLE.blue : BADGE_STYLE.green;
            const loadPct = typeof node.load === 'number' ? Math.max(0, Math.min(100, node.load)) : null;
            const loadColor =
              loadPct === null
                ? '#3B9C52'
                : loadPct >= 80
                ? '#DC5B4B'
                : loadPct >= 55
                ? '#D9822B'
                : '#3B9C52';

            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                {renderNodeShape(node, isDark)}

                {/* Status pill badge above node */}
                {node.badge && (
                  <g transform={`translate(0, ${node.type === 'uml' ? -68 : -46})`}>
                    <rect
                      x={-(node.badge.length * 3.4 + 10)}
                      y={-10}
                      width={node.badge.length * 6.8 + 20}
                      height={19}
                      rx={9.5}
                      fill={isDark ? bStyle.bgD : bStyle.bgL}
                      stroke={isDark ? bStyle.textD : bStyle.textL}
                      strokeWidth={1}
                      strokeOpacity={0.55}
                    />
                    <text
                      x={0}
                      y={2.5}
                      textAnchor="middle"
                      fill={isDark ? bStyle.textD : bStyle.textL}
                      fontSize="9.3"
                      fontWeight="600"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {node.badge}
                    </text>
                  </g>
                )}

                {/* Side callout pill (e.g. database table name) */}
                {node.callout && (
                  <g transform="translate(56, -8)">
                    <rect
                      x={-24}
                      y={-10}
                      width={Math.max(54, node.callout.length * 6.2 + 16)}
                      height={19}
                      rx={9.5}
                      fill={isDark ? '#292520' : '#FCF9F2'}
                      stroke={isDark ? '#78716C' : '#1F1D1A'}
                      strokeWidth={1}
                    />
                    <text
                      x={-24 + Math.max(54, node.callout.length * 6.2 + 16) / 2}
                      y={2.5}
                      textAnchor="middle"
                      fill={isDark ? '#E4DDD2' : '#1F1D1A'}
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {node.callout}
                    </text>
                  </g>
                )}

                {/* Optional Live CPU/Load Meter Bar */}
                {loadPct !== null && (
                  <g transform="translate(-26, 44)">
                    <rect
                      x={0}
                      y={0}
                      width={52}
                      height={7}
                      rx={3.5}
                      fill={isDark ? '#322D28' : '#E5DDD0'}
                      stroke={isDark ? '#575046' : '#1F1D1A'}
                      strokeWidth={0.8}
                    />
                    <rect
                      x={0.5}
                      y={0.5}
                      width={(51 * loadPct) / 100}
                      height={6}
                      rx={3}
                      fill={loadColor}
                    />
                    <text
                      x={56}
                      y={6.5}
                      fill={loadColor}
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {loadPct}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Optional Inset Analytical Card inside Canvas (e.g. Byte breakdown / Quorum math) */}
          {scene.overlayCard && (
            <g transform={`translate(${scene.overlayCard.x ?? 455}, ${scene.overlayCard.y ?? 20})`}>
              <rect
                x={3}
                y={3}
                width={284}
                height={62 + (scene.overlayCard.rows?.length || 0) * 26}
                rx={12}
                fill="#000"
                opacity={isDark ? 0.35 : 0.1}
              />
              <rect
                x={0}
                y={0}
                width={284}
                height={62 + (scene.overlayCard.rows?.length || 0) * 26}
                rx={12}
                fill={isDark ? '#24201C' : '#FCF9F2'}
                stroke={isDark ? '#5A5247' : '#1F1D1A'}
                strokeWidth={1.3}
              />
              <text
                x={14}
                y={22}
                fill={isDark ? '#B5ACA0' : '#5E584F'}
                fontSize="9.5"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                {scene.overlayCard.title}
              </text>
              {(scene.overlayCard.rows || []).map((r, rIdx) => {
                const rt = getTone(r.tone || 'green');
                const yOff = 38 + rIdx * 26;
                return (
                  <g key={rIdx} transform={`translate(14, ${yOff})`}>
                    <text x={0} y={8} fill={isDark ? '#F2EDE4' : '#1F1D1A'} fontSize="10" fontFamily="JetBrains Mono, monospace">
                      {r.label}
                    </text>
                    <text x={256} y={8} textAnchor="end" fill={isDark ? '#E4DDD2' : '#1F1D1A'} fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                      {r.value}
                    </text>
                    <rect x={0} y={13} width={256} height={6} rx={3} fill={isDark ? '#322D28' : '#ECE5D8'} />
                    <rect x={0} y={13} width={Math.max(8, (256 * (r.pct || 20)) / 100)} height={6} rx={3} fill={rt.dot} />
                  </g>
                );
              })}
              {scene.overlayCard.footer && (
                <text
                  x={14}
                  y={48 + (scene.overlayCard.rows?.length || 0) * 26}
                  fill={isDark ? '#A7E89E' : '#1D6B2A'}
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  ★ {scene.overlayCard.footer}
                </text>
              )}
            </g>
          )}
        </svg>

        {/* Bottom Legend & Playback Controls Overlay */}
        <div className="absolute bottom-2.5 inset-x-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-paper-card/90 dark:bg-ink-card/90 px-3 py-1.5 border border-ink/15 dark:border-ink-border backdrop-blur-sm pointer-events-auto">
            {(scene.legend || [
              { label: 'request', tone: 'coral' },
              { label: 'response', tone: 'green' },
            ]).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 text-[11px] font-mono text-ink-muted dark:text-paper-ink/80">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full border border-ink/40"
                  style={{ backgroundColor: getTone(item.tone).dot }}
                />
                {item.label}
              </span>
            ))}
          </div>

          {/* Controls: Replay, Pause, Fullscreen */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={onReplay}
              title="Replay animations (R)"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/70 bg-paper-card text-ink shadow-tactile-sm hover:bg-paper-subtle dark:border-paper-ink/35 dark:bg-ink-elevated dark:text-paper-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onTogglePause}
              title={paused ? 'Resume animations (Space)' : 'Pause animations (Space)'}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/70 bg-paper-card text-ink shadow-tactile-sm hover:bg-paper-subtle dark:border-paper-ink/35 dark:bg-ink-elevated dark:text-paper-ink"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((v) => !v)}
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen diagram'}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/70 bg-paper-card text-ink shadow-tactile-sm hover:bg-paper-subtle dark:border-paper-ink/35 dark:bg-ink-elevated dark:text-paper-ink"
            >
              {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
        <div className="w-full max-w-6xl h-[88vh]">{stageBody}</div>
      </div>
    );
  }

  return stageBody;
}
