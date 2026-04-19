"use strict";

// =============================================================================
// 1) LOG — helper only (prints lines; not part of the browser touch/click lesson)
// =============================================================================
const logOutput = document.querySelector("#log-output");
const logLines = [];
const LOG_MAX = 120;

const log = (msg) => {
  const t = new Date().toISOString().slice(11, 23);
  logLines.push("[" + t + "] " + msg);
  if (logLines.length > LOG_MAX) logLines.splice(0, logLines.length - LOG_MAX);
  logOutput.textContent = logLines.join("\n");
  logOutput.scrollTop = logOutput.scrollHeight;
};

document.querySelector("#log-clear").addEventListener("click", () => {
  logLines.length = 0;
  logOutput.textContent = "";
});

// =============================================================================
// 2) One shared list — button vs draggable thumb (same listeners, different gesture)
// =============================================================================
const TAP_EVENT_TYPES = [
  "pointerdown",
  "pointerup",
  "pointercancel",
  "touchstart",
  "touchend",
  "touchcancel",
  // "mousedown",
  // "mouseup",
  "click",
];

/** Logs every type in TAP_EVENT_TYPES; prefix tells which UI fired. */
const attachTapFamilyLogger = (el, prefix) => {
  const onEvt = (e) => {
    const extra = e.pointerType ? " · " + e.pointerType : "";
    log(prefix + e.type + extra);
  };
  TAP_EVENT_TYPES.forEach((type) => {
    el.addEventListener(type, onEvt, { passive: true });
  });
};

const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);

/** Horizontal drag; pointermove / touchmove are not logged (too noisy). */
const setupHorizontalDrag = (rail, thumb) => {
  let dragOn = false;
  let dragStartX = 0;
  let dragStartLeft = 0;

  thumb.addEventListener("pointerdown", (e) => {
    dragOn = true;
    thumb.setPointerCapture(e.pointerId);
    dragStartX = e.clientX;
    dragStartLeft = thumb.offsetLeft;
  });

  thumb.addEventListener("pointermove", (e) => {
    if (!dragOn) return;
    const max = rail.clientWidth - thumb.clientWidth;
    thumb.style.left =
      clamp(dragStartLeft + (e.clientX - dragStartX), 0, max) + "px";
  });

  const end = (e) => {
    if (!dragOn) return;
    dragOn = false;
    try {
      thumb.releasePointerCapture(e.pointerId);
    } catch (_e) {
      /* ignore */
    }
  };

  thumb.addEventListener("pointerup", end);
  thumb.addEventListener("pointercancel", end);
};

// --- 1) Tap (native button) ---
const tapButton = document.querySelector("#tap-button");
attachTapFamilyLogger(tapButton, "[1 tap] ");

// --- 2) Same listeners + drag — compare [1 tap] vs [2 drag] (tap vs drag on thumb) ---
const dragRail = document.querySelector("#drag-rail");
const dragThumb = document.querySelector("#drag-thumb");
attachTapFamilyLogger(dragThumb, "[2 drag] ");
setupHorizontalDrag(dragRail, dragThumb);
