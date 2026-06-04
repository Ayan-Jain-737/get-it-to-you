import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTutorial } from './useTutorial';
import styles from './TutorialOverlay.module.css';

const parseMarkdown = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const TutorialOverlay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isActive, step, currentStepData, totalSteps, advanceStep, skipTutorial, completeTutorial } = useTutorial();
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  const getTargetSelector = useCallback((stepData) => {
    if (!stepData?.target) return null;
    const isMobile = window.innerWidth < 768;
    const targetKey = isMobile && stepData.targetMobile ? stepData.targetMobile : stepData.target;
    return `[data-tutorial="${targetKey}"]`;
  }, []);

  /**
   * Monitor for target element, attach click listeners, and update targetRect.
   */
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    let attachedEl = null;

    const handleClick = () => {
      // Advance step when user clicks the target!
      setTimeout(() => advanceStep(), 150);
    };

    const checkAndMeasure = () => {
      const selector = getTargetSelector(currentStepData);
      if (!selector) {
        setTargetRect(null);
        return;
      }

      const el = document.querySelector(selector);
      if (!el) {
        setTargetRect(null);
        return;
      }

      // Attach click listener for waitForClick logic
      let clickEl = el;
      if (typeof currentStepData.waitForClick === 'string') {
        clickEl = document.querySelector(`[data-tutorial="${currentStepData.waitForClick}"]`) || el;
      }

      if (currentStepData.waitForClick && attachedEl !== clickEl) {
        if (attachedEl) attachedEl.removeEventListener('click', handleClick);
        clickEl.addEventListener('click', handleClick);
        attachedEl = clickEl;
      }

      const rect = el.getBoundingClientRect();
      const padding = 8;
      
      setTargetRect(prev => {
        const newRect = {
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        };
        // Avoid state thrashing if nothing changed
        if (prev && prev.top === newRect.top && prev.left === newRect.left && prev.width === newRect.width && prev.height === newRect.height) {
          return prev;
        }
        return newRect;
      });
    };

    checkAndMeasure();
    // Poll for dynamic DOM elements like modals
    const intervalId = setInterval(checkAndMeasure, 100);

    return () => {
      clearInterval(intervalId);
      if (attachedEl) attachedEl.removeEventListener('click', handleClick);
    };
  }, [isActive, currentStepData, getTargetSelector, advanceStep]);

  /**
   * Scroll target into view if needed when step changes
   */
  useEffect(() => {
    if (!currentStepData) return;
    const selector = getTargetSelector(currentStepData);
    if (!selector) return;

    setTimeout(() => {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 150);
  }, [step, currentStepData, getTargetSelector]);

  /**
   * Recalculate tooltip position when targetRect changes.
   */
  useEffect(() => {
    if (!targetRect || !tooltipRef.current) return;

    const tooltipEl = tooltipRef.current;
    const tooltipH = tooltipEl.offsetHeight;
    const tooltipW = tooltipEl.offsetWidth;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const gap = 16;

    let top, left;

    // Default: below the target
    top = targetRect.top + targetRect.height + gap;
    left = targetRect.left + targetRect.width / 2 - tooltipW / 2;

    // If tooltip goes below viewport, place above
    if (top + tooltipH > viewH - 20) {
      top = targetRect.top - tooltipH - gap;
    }

    // If still off-screen (top), center it
    if (top < 20) {
      top = Math.max(20, viewH / 2 - tooltipH / 2);
    }

    // Clamp left
    if (left < 12) left = 12;
    if (left + tooltipW > viewW - 12) left = viewW - tooltipW - 12;

    // On mobile, if target is in bottom nav (bottom of screen), put tooltip above
    if (window.innerWidth < 768 && targetRect.top > viewH - 120) {
      top = targetRect.top - tooltipH - gap;
      if (top < 20) top = 20;
    }

    setTooltipPos({ top, left });
  }, [targetRect]);

  /**
   * Handle navigation when step changes.
   */
  useEffect(() => {
    if (!isActive || !currentStepData?.route) return;
    if (location.pathname !== currentStepData.route) {
      navigate(currentStepData.route);
    }
  }, [step, isActive, currentStepData?.route, navigate, location.pathname]);

  const handleContinue = useCallback(() => {
    if (!currentStepData) return;
    if (step === totalSteps - 1) {
      completeTutorial();
      return;
    }
    advanceStep();
  }, [step, totalSteps, currentStepData, advanceStep, completeTutorial]);

  if (!isActive || !currentStepData) return null;

  const isCenterModal = !currentStepData.target || !targetRect;
  const progress = ((step + 1) / totalSteps) * 100;
  const isAutoAdvance = !!currentStepData.autoAdvanceMs;

  // Recalculate tooltip position directly inside render to support tooltipPlacement
  let finalTooltipTop = tooltipPos.top;
  let finalTooltipLeft = tooltipPos.left;

  if (targetRect && currentStepData.tooltipPlacement === 'top') {
    // Put it ABOVE the target instead of below
    const gap = 16;
    const tooltipH = tooltipRef.current?.offsetHeight || 200;
    finalTooltipTop = targetRect.top - tooltipH - gap;
    if (finalTooltipTop < 20) {
      finalTooltipTop = 20; // fallback if it goes offscreen
    }
  } else if (targetRect && currentStepData.tooltipPlacement === 'right') {
    const gap = 24;
    const tooltipW = tooltipRef.current?.offsetWidth || 300;
    const tooltipH = tooltipRef.current?.offsetHeight || 200;
    
    if (targetRect.left + targetRect.width + gap + tooltipW <= window.innerWidth - 12) {
      // Fits on the right
      finalTooltipLeft = targetRect.left + targetRect.width + gap;
      finalTooltipTop = targetRect.top + 20; // Slight offset from top edge
    } else {
      // Fallback: put it above if space, else below
      if (targetRect.top - tooltipH - gap > 20) {
        finalTooltipTop = targetRect.top - tooltipH - gap;
      } else {
        finalTooltipTop = Math.min(targetRect.top + targetRect.height + gap, window.innerHeight - tooltipH - 20);
      }
      finalTooltipLeft = Math.max(12, Math.min(targetRect.left + targetRect.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - 12));
    }
  }

  if (currentStepData?.invisible) {
    return null;
  }

  return (
    <>
      <div className={styles.overlay}>
        {/* Dark backdrop only for center modals */}
        {isCenterModal ? (
          <div className={styles.backdropDark} style={{ pointerEvents: 'auto' }} />
        ) : null}

        {/* Spotlight cutout */}
        {!isCenterModal && targetRect && (
          <div
            className={`${styles.spotlightCutout} ${styles.spotlightPulse}`}
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              pointerEvents: currentStepData.disableHoleClick ? 'auto' : 'none',
            }}
          />
        )}

        {/* Tooltip / Center Modal */}
        {isCenterModal ? (
          <div className={`${styles.centerModal} ${styles.tooltipEnter}`} key={`center-${step}`}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.stepCounter}>Step {step + 1} of {totalSteps}</div>

            <div className={styles.tooltipTitle}>{currentStepData.title}</div>
            <div className={styles.tooltipText}>{parseMarkdown(currentStepData.text)}</div>

            {currentStepData.btn && !isAutoAdvance && !currentStepData.waitForClick && (
              <button className={styles.tooltipBtn} onClick={handleContinue}>
                {currentStepData.btn}
              </button>
            )}

            {isAutoAdvance && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, animation: 'spin 1s linear infinite' }}>hourglass_empty</span>
              </div>
            )}

            <button className={styles.skipBtn} onClick={skipTutorial}>
              Skip Tutorial
            </button>
          </div>
        ) : (
          <div
            className={`${styles.tooltip} ${styles.tooltipEnter}`}
            ref={tooltipRef}
            key={`tip-${step}`}
            style={{
              top: finalTooltipTop,
              left: finalTooltipLeft,
              pointerEvents: 'auto', // Allow clicks on tooltip
            }}
          >
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.stepCounter}>Step {step + 1} of {totalSteps}</div>

            <div className={styles.tooltipTitle}>{currentStepData.title}</div>
            <div className={styles.tooltipText}>{parseMarkdown(currentStepData.text)}</div>

            {currentStepData.btn && !isAutoAdvance && !currentStepData.waitForClick && (
              <button className={styles.tooltipBtn} onClick={handleContinue}>
                {currentStepData.btn}
              </button>
            )}

            {isAutoAdvance && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, animation: 'spin 1s linear infinite' }}>hourglass_empty</span>
              </div>
            )}

            <button className={styles.skipBtn} onClick={skipTutorial}>
              Skip Tutorial
            </button>
          </div>
        )}
      </div>

      {/* 4 Click Blockers: Top, Bottom, Left, Right of the Spotlight Hole */}
      {!isCenterModal && targetRect && !currentStepData.disableBlockers && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: targetRect.top, zIndex: 9997, pointerEvents: 'auto' }} />
          <div style={{ position: 'fixed', top: targetRect.top + targetRect.height, left: 0, right: 0, bottom: 0, zIndex: 9997, pointerEvents: 'auto' }} />
          <div style={{ position: 'fixed', top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height, zIndex: 9997, pointerEvents: 'auto' }} />
          <div style={{ position: 'fixed', top: targetRect.top, left: targetRect.left + targetRect.width, right: 0, height: targetRect.height, zIndex: 9997, pointerEvents: 'auto' }} />
        </>
      )}
    </>
  );
};

export default TutorialOverlay;
