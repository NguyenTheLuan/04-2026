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
// 2) TAP — one user press+release, but the browser emits many different event names
// =============================================================================
const tapButton = document.querySelector("#tap-button");

const TAP_EVENT_TYPES = [
  "pointerdown",
  "pointerup",
  "touchstart",
  "touchend",
  "touchcancel",
  "mousedown",
  "mouseup",
  "click",
];

const onTapButtonEvent = (e) => {
  const extra = e.pointerType ? " · " + e.pointerType : "";
  log(e.type + extra);
};

TAP_EVENT_TYPES.forEach((type) => {
  tapButton.addEventListener(type, onTapButtonEvent, { passive: true });
});

// =============================================================================
// 3) DRAG — lesson: many pointermove events while the pointer moves (not “one click”)
// =============================================================================
const dragRail = document.querySelector("#drag-rail");
const dragThumb = document.querySelector("#drag-thumb");
let dragOn = false;
let dragStartX = 0;
let dragStartLeft = 0;

const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);

dragThumb.addEventListener("pointerdown", (e) => {
  dragOn = true;
  dragThumb.setPointerCapture(e.pointerId);
  dragStartX = e.clientX;
  dragStartLeft = dragThumb.offsetLeft;
  log("pointerdown (drag)");
});

dragThumb.addEventListener("pointermove", (e) => {
  if (!dragOn) return;
  const max = dragRail.clientWidth - dragThumb.clientWidth;
  dragThumb.style.left =
    clamp(dragStartLeft + (e.clientX - dragStartX), 0, max) + "px";
  // pointermove fires very often — we do not log each one (keeps the log readable).
});

const dragEnd = (e) => {
  if (!dragOn) return;
  dragOn = false;
  try {
    dragThumb.releasePointerCapture(e.pointerId);
  } catch (_e) {
    /* ignore */
  }
  log(e.type === "pointercancel" ? "pointercancel (drag)" : "pointerup (drag)");
};

dragThumb.addEventListener("pointerup", dragEnd);
dragThumb.addEventListener("pointercancel", dragEnd);
