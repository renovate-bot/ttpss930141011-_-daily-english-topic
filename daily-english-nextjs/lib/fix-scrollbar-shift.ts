/**
 * Utility to prevent layout shift when scrollbar appears/disappears.
 * This is commonly needed when opening modals that set body overflow to hidden.
 */

/**
 * Get the width of the scrollbar.
 * @returns The width of the scrollbar in pixels
 */
export function getScrollbarWidth(): number {
  // Create a temporary div to measure scrollbar width
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  document.body.removeChild(outer);

  return scrollbarWidth;
}

/**
 * Apply padding to compensate for scrollbar removal.
 * @param scrollbarWidth The width of the scrollbar
 */
export function applyScrollbarCompensation(scrollbarWidth: number): void {
  // Apply padding to body to compensate for scrollbar
  document.body.style.paddingRight = `${scrollbarWidth}px`;
  
  // Also apply to fixed elements to prevent them from shifting
  const fixedElements = document.querySelectorAll('[data-fixed-element]');
  fixedElements.forEach((element) => {
    const el = element as HTMLElement;
    el.style.paddingRight = `${scrollbarWidth}px`;
  });
}

/**
 * Remove scrollbar compensation.
 */
export function removeScrollbarCompensation(): void {
  document.body.style.paddingRight = '';
  
  const fixedElements = document.querySelectorAll('[data-fixed-element]');
  fixedElements.forEach((element) => {
    const el = element as HTMLElement;
    el.style.paddingRight = '';
  });
}

/**
 * Hook to manage scrollbar compensation.
 * Use this when opening/closing modals.
 */
export function useScrollbarCompensation() {
  return {
    onOpen: () => {
      const scrollbarWidth = getScrollbarWidth();
      if (scrollbarWidth > 0) {
        applyScrollbarCompensation(scrollbarWidth);
      }
    },
    onClose: () => {
      removeScrollbarCompensation();
    }
  };
}