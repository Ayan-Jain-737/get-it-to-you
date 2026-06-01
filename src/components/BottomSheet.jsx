import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './BottomSheet.module.css';

// Snap points as fractions of viewport height (from bottom)
const SNAP_PEEK = 0.18;  // ~18vh — compact status header
const SNAP_HALF = 0.50;  // ~50vh — timeline + action
const SNAP_FULL = 0.92;  // ~92vh — everything

const SNAPS = [SNAP_PEEK, SNAP_HALF, SNAP_FULL];
const SNAP_LABELS = ['peek', 'half', 'full'];

const BottomSheet = ({ children, onSnapChange, initialSnap = 'half' }) => {
  const initialIndex = SNAP_LABELS.indexOf(initialSnap);
  const [snapIndex, setSnapIndex] = useState(initialIndex >= 0 ? initialIndex : 1);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTranslateY, setCurrentTranslateY] = useState(null);

  const dragStartY = useRef(0);
  const dragStartTranslate = useRef(0);
  const sheetRef = useRef(null);

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const getTranslateForSnap = useCallback((idx) => {
    return (SNAP_FULL - SNAPS[idx]) * vh;
  }, [vh]);

  // Notify parent of snap changes
  useEffect(() => {
    if (onSnapChange) {
      onSnapChange(SNAP_LABELS[snapIndex]);
    }
  }, [snapIndex, onSnapChange]);

  const handleTouchStart = useCallback((e) => {
    // Don't drag if user is scrolling content inside the sheet body
    const target = e.target;
    const sheetBody = sheetRef.current?.querySelector('[data-sheet-body]');
    if (sheetBody && sheetBody.contains(target) && sheetBody.scrollTop > 0) {
      return;
    }

    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
    dragStartTranslate.current = getTranslateForSnap(snapIndex);
  }, [snapIndex, getTranslateForSnap]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - dragStartY.current;
    const newTranslate = dragStartTranslate.current + deltaY;

    // Clamp: don't let it go above full or below peek
    const minTranslate = getTranslateForSnap(2); // full
    const maxTranslate = getTranslateForSnap(0); // peek
    const clamped = Math.max(minTranslate, Math.min(maxTranslate, newTranslate));
    setCurrentTranslateY(clamped);
  }, [isDragging, vh, getTranslateForSnap]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (currentTranslateY === null) return;

    // Find closest snap
    let closestIdx = 0;
    let closestDist = Infinity;
    for (let i = 0; i < SNAPS.length; i++) {
      const snapTranslate = getTranslateForSnap(i);
      const dist = Math.abs(currentTranslateY - snapTranslate);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    // Velocity heuristic: if dragged far enough from start, prefer the direction
    const dragDelta = currentTranslateY - dragStartTranslate.current;
    if (Math.abs(dragDelta) > vh * 0.08) {
      // Dragged down → go to lower snap
      if (dragDelta > 0 && snapIndex > 0) {
        closestIdx = snapIndex - 1;
      }
      // Dragged up → go to higher snap
      if (dragDelta < 0 && snapIndex < SNAPS.length - 1) {
        closestIdx = snapIndex + 1;
      }
    }

    setSnapIndex(closestIdx);
    setCurrentTranslateY(null);
  }, [isDragging, currentTranslateY, snapIndex, vh, getTranslateForSnap]);

  const handleTap = useCallback(() => {
    if (isDragging) return;
    // Cycle: peek → half → full → half
    if (snapIndex === 0) setSnapIndex(1);
    else if (snapIndex === 1) setSnapIndex(2);
    else setSnapIndex(1);
  }, [snapIndex, isDragging]);

  // Programmatic expand (for chat focus)
  const expandToFull = useCallback(() => {
    setSnapIndex(2);
  }, []);

  const translateY = isDragging && currentTranslateY !== null
    ? currentTranslateY
    : getTranslateForSnap(snapIndex);

  const snapLabel = SNAP_LABELS[snapIndex];

  return (
    <>
      {/* Backdrop for full state */}
      <div
        className={`${styles.backdrop} ${snapLabel === 'full' ? styles.visible : ''}`}
        onClick={() => setSnapIndex(1)}
      />

      <div
        ref={sheetRef}
        className={`${styles.sheet} ${styles[snapLabel]} ${isDragging ? styles.dragging : ''}`}
        style={{ transform: `translateY(${translateY}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className={styles.handleBar} onClick={handleTap}>
          <div className={styles.handleNub} />
        </div>

        <div className={styles.expandHint} onClick={handleTap}>
          <span className="material-symbols-outlined">expand_less</span>
        </div>

        {/* Sheet Body */}
        <div
          data-sheet-body
          className={`${styles.sheetBody} ${snapLabel === 'peek' ? styles.noScroll : ''}`}
        >
          {typeof children === 'function'
            ? children({ snapLabel, expandToFull })
            : children
          }
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
