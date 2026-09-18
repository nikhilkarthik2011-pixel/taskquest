import { useEffect, useLayoutEffect, useRef, useState } from "react";

const PAD = 8;
const MAX_LOCATE_ATTEMPTS = 15;

export default function OnboardingTour({ steps, active, onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [ready, setReady] = useState(false);

  const step = steps[stepIndex];

  // Reset to the first step whenever the tour is (re)opened.
  useEffect(() => {
    if (active) setStepIndex(0);
  }, [active]);

  // Find (and scroll to) the target element for the current step.
  useLayoutEffect(() => {
    if (!active) return;
    setReady(false);
    let cancelled = false;
    let attempts = 0;

    function tryLocate() {
      if (cancelled) return;
      if (!step?.target) {
        setRect(null);
        setReady(true);
        return;
      }
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) {
        attempts += 1;
        if (attempts > MAX_LOCATE_ATTEMPTS) {
          // Couldn't find it (e.g. tour opened from a page that doesn't
          // have this element) — skip this step instead of getting stuck.
          setStepIndex((i) => (i < steps.length - 1 ? i + 1 : i));
          if (stepIndex >= steps.length - 1) onFinish();
          return;
        }
        setTimeout(tryLocate, 100);
        return;
      }
      el.scrollIntoView({ block: "center", behavior: "instant" });
      requestAnimationFrame(() => {
        if (cancelled) return;
        setRect(el.getBoundingClientRect());
        setReady(true);
      });
    }

    tryLocate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  // Keep the highlight glued to its target on resize/scroll.
  useEffect(() => {
    if (!active || !step?.target) return;
    function update() {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    }
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, step]);

  // Escape key skips the tour.
  useEffect(() => {
    if (!active) return;
    function onKey(e) {
      if (e.key === "Escape") onFinish();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onFinish]);

  if (!active || !ready || !step) return null;

  const isLast = stepIndex === steps.length - 1;

  function next() {
    if (isLast) onFinish();
    else setStepIndex((i) => i + 1);
  }
  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {rect ? <Frame rect={rect} /> : <div className="absolute inset-0 bg-slate-900/60" />}
      <TourTooltip
        step={step}
        rect={rect}
        index={stepIndex}
        total={steps.length}
        onNext={next}
        onBack={stepIndex > 0 ? back : null}
        onSkip={onFinish}
        isLast={isLast}
      />
    </div>
  );
}

function Frame({ rect }) {
  const top = Math.max(rect.top - PAD, 0);
  const left = Math.max(rect.left - PAD, 0);
  const width = rect.width + PAD * 2;
  const height = rect.height + PAD * 2;
  const bottom = top + height;
  const right = left + width;

  const bar = "fixed bg-slate-900/60 transition-all duration-200";
  return (
    <>
      <div className={bar} style={{ top: 0, left: 0, right: 0, height: top }} />
      <div className={bar} style={{ top: bottom, left: 0, right: 0, bottom: 0 }} />
      <div className={bar} style={{ top, left: 0, width: left, height }} />
      <div className={bar} style={{ top, left: right, right: 0, height }} />
      <div
        className="fixed rounded-2xl ring-4 ring-brand-400 transition-all duration-200 pointer-events-none"
        style={{ top, left, width, height }}
      />
    </>
  );
}

function TourTooltip({ step, rect, index, total, onNext, onBack, onSkip, isLast }) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({ opacity: 0 });

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    const margin = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!rect) {
      setStyle({ top: vh / 2 - ch / 2, left: vw / 2 - cw / 2, opacity: 1 });
      return;
    }

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    let top =
      spaceBelow >= ch + margin || spaceBelow >= spaceAbove
        ? rect.bottom + margin
        : rect.top - ch - margin;
    top = Math.max(margin, Math.min(top, vh - ch - margin));

    let left = rect.left + rect.width / 2 - cw / 2;
    left = Math.max(margin, Math.min(left, vw - cw - margin));

    setStyle({ top, left, opacity: 1 });
  }, [rect, step]);

  return (
    <div
      ref={cardRef}
      className="fixed z-[101] w-[90vw] max-w-sm rounded-3xl bg-white p-5 shadow-2xl transition-opacity duration-150 dark:bg-[#1f1640]"
      style={style}
      role="dialog"
      aria-live="polite"
    >
      <p className="mb-1 font-display text-base font-extrabold text-slate-800 dark:text-white">
        {step.title}
      </p>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-300">{step.body}</p>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="shrink-0 text-xs font-bold text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          <span className="mr-1 text-xs font-semibold text-slate-400">
            {index + 1}/{total}
          </span>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border-2 border-slate-200 px-3 py-1.5 font-display text-xs font-bold text-slate-600 transition hover:border-brand-400 dark:border-white/10 dark:text-slate-200"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-1.5 font-display text-xs font-bold text-white transition hover:scale-105"
          >
            {isLast ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}