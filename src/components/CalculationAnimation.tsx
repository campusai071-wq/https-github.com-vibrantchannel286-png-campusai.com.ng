import React, { useEffect, useRef, useState } from 'react';

const INSTITUTIONS = ['UNILAG', 'OAU', 'UI', 'FUTA', 'UNIABUJA', 'ABU', 'UNIBEN', 'LASU'];
const COURSES = ['Medicine', 'Law', 'Engineering', 'Computer Sci', 'Pharmacy', 'Architecture'];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function useAnimatedNumber(target: number, duration = 1000) {
  const [value, setValue] = useState(target);
  const startRef = useRef<number | null>(null);
  const startValRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startValRef.current = value;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(lerp(startValRef.current, target, ease)));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return value;
}

type Particle = { id: number; x: number; y: number; vx: number; vy: number; life: number; color: string };
const PARTICLE_COLORS = ['#10b981', '#3b82f6', '#a78bfa', '#f59e0b'];

const CalculationAnimation: React.FC = () => {
  const [instIdx, setInstIdx] = useState(0);
  const [courseIdx, setCourseIdx] = useState(0);
  const [jamb, setJamb] = useState(312);
  const [postUtme, setPostUtme] = useState(72);
  const [aggregate, setAggregate] = useState(76);
  const [meritPct, setMeritPct] = useState(87);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [streamLines, setStreamLines] = useState<string[]>([]);
  const [glowActive, setGlowActive] = useState(false);
  const pidRef = useRef(0);

  const animJamb = useAnimatedNumber(jamb, 900);
  const animPostUtme = useAnimatedNumber(postUtme, 900);
  const animAggregate = useAnimatedNumber(aggregate, 1100);
  const animMerit = useAnimatedNumber(meritPct, 1300);

  // Rotate institution + scores every 3.5s
  useEffect(() => {
    const id = setInterval(() => {
      const nextInst = (instIdx + 1) % INSTITUTIONS.length;
      const nextCourse = Math.floor(Math.random() * COURSES.length);
      const j = 230 + Math.floor(Math.random() * 130);
      const p = 50 + Math.floor(Math.random() * 45);
      const agg = Math.round(j / 8 + p * 0.4);
      const merit = 55 + Math.floor(Math.random() * 42);
      setInstIdx(nextInst);
      setCourseIdx(nextCourse);
      setJamb(j);
      setPostUtme(p);
      setAggregate(agg);
      setMeritPct(merit);
      setGlowActive(true);
      setTimeout(() => setGlowActive(false), 500);
      // burst particles
      setParticles(prev => [
        ...prev,
        ...Array.from({ length: 14 }, () => ({
          id: pidRef.current++,
          x: 60 + Math.random() * 180,
          y: 60 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 3.5,
          vy: -1.5 - Math.random() * 2.5,
          life: 1,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        })),
      ].slice(-70));
    }, 3500);
    return () => clearInterval(id);
  }, [instIdx]);

  // Particle tick
  useEffect(() => {
    const id = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.028 }))
          .filter(p => p.life > 0)
      );
    }, 30);
    return () => clearInterval(id);
  }, []);

  // Data stream
  useEffect(() => {
    const lines = [
      `→ Fetching ${INSTITUTIONS[instIdx]} cutoff data...`,
      `✓ JAMB score validated: ${jamb}`,
      `⚡ Running merit algorithm...`,
      `→ Post-UTME weight: ${postUtme}%`,
      `✓ Aggregate computed: ${aggregate}`,
      `⚡ Probability matrix: ${meritPct}%`,
      `✓ Departmental quota checked`,
    ];
    let i = 0;
    setStreamLines([]);
    const id = setInterval(() => {
      if (i < lines.length) { setStreamLines(l => [...l.slice(-5), lines[i]]); i++; }
    }, 400);
    return () => clearInterval(id);
  }, [instIdx, meritPct]);

  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference * (1 - animMerit / 100);
  const ringColor = animMerit >= 80 ? '#10b981' : animMerit >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div
      style={{
        width: 310,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '18px 18px 14px',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        boxShadow: glowActive ? '0 0 36px 6px rgba(16,185,129,0.22)' : '0 0 0px transparent',
        transition: 'box-shadow 0.4s ease',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      {/* Grid background */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }} viewBox="0 0 310 320" preserveAspectRatio="none">
        {[0,1,2,3,4,5,6].map(i => <line key={`h${i}`} x1="0" y1={i*52} x2="310" y2={i*52} stroke="#10b981" strokeWidth="0.5"/>)}
        {[0,1,2,3,4,5,6,7].map(i => <line key={`v${i}`} x1={i*44} y1="0" x2={i*44} y2="320" stroke="#3b82f6" strokeWidth="0.5"/>)}
      </svg>

      {/* Particles */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 310 320">
        {particles.map(p => (
          <circle key={p.id} cx={p.x} cy={p.y} r={3 * p.life} fill={p.color} opacity={p.life * 0.85} />
        ))}
      </svg>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, position: 'relative' }}>
        <div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 3 }}>AI Admission Engine</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', transition: 'all 0.5s' }}>{INSTITUTIONS[instIdx]}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', transition: 'all 0.5s' }}>{COURSES[courseIdx]}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'caLivePing 1.2s infinite' }} />
          <span style={{ fontSize: 8, fontWeight: 900, color: '#10b981', letterSpacing: '0.14em' }}>LIVE</span>
        </div>
      </div>

      {/* Score bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px', marginBottom: 14, position: 'relative' }}>
        {[
          { label: 'JAMB Score', value: animJamb, max: 400, color: '#3b82f6' },
          { label: "O'Level", value: 8, max: 9, color: '#a78bfa' },
          { label: 'Post-UTME', value: animPostUtme, max: 100, color: '#f59e0b', suffix: '%' },
          { label: 'Aggregate', value: animAggregate, max: 100, color: '#10b981' },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 900, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}{s.suffix || ''}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((s.value / s.max) * 100, 100)}%`,
                background: s.color,
                borderRadius: 2,
                transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
                boxShadow: `0 0 6px ${s.color}55`,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Merit ring + probability */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, position: 'relative' }}>
        <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
          <svg width="96" height="96" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
            <circle cx="50" cy="50" r="44" fill="none" stroke={ringColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1), stroke 0.5s', transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
            />
            {Array.from({ length: 20 }).map((_, i) => {
              const a = (i / 20) * 360 - 90, r = (a * Math.PI) / 180;
              return <line key={i} x1={50 + 36 * Math.cos(r)} y1={50 + 36 * Math.sin(r)} x2={50 + 40 * Math.cos(r)} y2={50 + 40 * Math.sin(r)} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />;
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{animMerit}%</span>
            <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3 }}>Merit</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Admission Probability</div>
          {[
            { label: 'Direct Entry', pct: Math.min(animMerit + 4, 99), color: '#10b981' },
            { label: 'On Merit', pct: Math.min(animMerit + 11, 99), color: '#3b82f6' },
            { label: 'Catchment', pct: Math.min(animMerit + 19, 99), color: '#a78bfa' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', flex: 1, whiteSpace: 'nowrap' }}>{row.label}</span>
              <div style={{ width: 55, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: 1, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: row.color, width: 26, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal stream */}
      <div style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 10px', minHeight: 70, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
          {['#ef4444','#f59e0b','#10b981'].map((c,i) => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block' }}/>)}
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', marginLeft: 3, letterSpacing: '0.12em' }}>AI ENGINE OUTPUT</span>
        </div>
        {streamLines.map((line, i) => (
          <div key={i} style={{ fontSize: 8, color: i === streamLines.length - 1 ? '#10b981' : 'rgba(255,255,255,0.28)', lineHeight: 1.75, transition: 'color 0.3s' }}>
            {line}
            {i === streamLines.length - 1 && (
              <span style={{ display: 'inline-block', width: 5, height: 9, background: '#10b981', marginLeft: 3, verticalAlign: 'middle', animation: 'caBlinkCursor 0.9s steps(1) infinite' }} />
            )}
          </div>
        ))}
      </div>

      {/* Verdict */}
      <div style={{
        marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 11px',
        background: animMerit >= 75 ? 'rgba(16,185,129,0.09)' : 'rgba(245,158,11,0.09)',
        border: `1px solid ${animMerit >= 75 ? 'rgba(16,185,129,0.22)' : 'rgba(245,158,11,0.22)'}`,
        borderRadius: 10, transition: 'all 0.5s', position: 'relative',
      }}>
        <div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>AI Verdict</div>
          <div style={{ fontSize: 10, fontWeight: 900, color: animMerit >= 75 ? '#10b981' : '#f59e0b', transition: 'color 0.5s' }}>
            {animMerit >= 85 ? '🎯 High Chance of Admission' : animMerit >= 70 ? '⚡ Moderate — Apply Now' : '⚠️ Borderline — Boost Score'}
          </div>
        </div>
        <div style={{
          fontSize: 8, fontWeight: 700,
          color: animMerit >= 75 ? '#10b981' : '#f59e0b',
          border: `1px solid ${animMerit >= 75 ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)'}`,
          borderRadius: 6, padding: '3px 8px', letterSpacing: '0.1em',
        }}>
          {animMerit >= 75 ? 'PROCEED' : 'REVIEW'}
        </div>
      </div>

      <style>{`
        @keyframes caLivePing { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.6)} }
        @keyframes caBlinkCursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      `}</style>
    </div>
  );
};

export default CalculationAnimation;