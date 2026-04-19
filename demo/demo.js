(function () {
  "use strict";

  const logEl = document.getElementById("log");
  const lines = [];
  const maxLines = 200;

  function log(msg) {
    const t = new Date().toISOString().slice(11, 23);
    lines.push(`[${t}] ${msg}`);
    if (lines.length > maxLines) lines.splice(0, lines.length - maxLines);
    logEl.textContent = lines.join("\n");
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  // --- Section 1: log all relevant events on the button ---
  document.getElementById("clear").addEventListener("click", () => {
    lines.length = 0;
    logEl.textContent = "";
  });

  const btn = document.getElementById("btn");
  const types = [
    "pointerdown",
    "pointerup",
    "touchstart",
    "touchend",
    "touchcancel",
    "mousedown",
    "mouseup",
    "click",
  ];
  types.forEach((type) => {
    btn.addEventListener(
      type,
      (e) => {
        const extra = e.pointerType ? ` pointerType=${e.pointerType}` : "";
        log(`${type} (target=${e.target.id || e.target.tagName})${extra}`);
      },
      { passive: true }
    );
  });

  // --- Section 2a: primary knob (pointer + capture, box has touch-action: none) ---
  const box = document.getElementById("dragBox");
  const knob = document.getElementById("knob");
  let dragging = false;
  let startX = 0;
  let startLeft = 0;

  knob.addEventListener("pointerdown", (e) => {
    dragging = true;
    knob.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startLeft = knob.offsetLeft;
    log("[knob] pointerdown capture set");
  });
  knob.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const maxL = box.clientWidth - knob.clientWidth;
    const next = clamp(startLeft + dx, 0, maxL);
    knob.style.left = `${next}px`;
  });
  knob.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    try {
      knob.releasePointerCapture(e.pointerId);
    } catch (_) {}
    log("[knob] pointerup release capture");
  });
  knob.addEventListener("pointercancel", () => {
    dragging = false;
    log("[knob] pointercancel");
  });

  // --- Section 2b: second knob — toggle Pointer vs touch-only ---
  const box2 = document.getElementById("dragBox2");
  const knob2 = document.getElementById("knob2");
  const usePointerEl = document.getElementById("usePointer");

  function clearKnob2Handlers() {
    knob2.onpointerdown = null;
    knob2.onpointermove = null;
    knob2.onpointerup = null;
    knob2.onpointercancel = null;
    knob2.ontouchstart = null;
    knob2.ontouchmove = null;
    knob2.ontouchend = null;
    knob2.ontouchcancel = null;
  }

  function attachKnob2Pointer() {
    let d = false;
    let sx = 0;
    let sl = 0;
    knob2.style.touchAction = "none";
    knob2.onpointerdown = (e) => {
      d = true;
      knob2.setPointerCapture(e.pointerId);
      sx = e.clientX;
      sl = knob2.offsetLeft;
      log("[knob2] pointerdown");
    };
    knob2.onpointermove = (e) => {
      if (!d) return;
      const maxL = box2.clientWidth - knob2.clientWidth;
      const next = clamp(sl + (e.clientX - sx), 0, maxL);
      knob2.style.left = `${next}px`;
    };
    const end = (e) => {
      if (!d) return;
      d = false;
      try {
        knob2.releasePointerCapture(e.pointerId);
      } catch (_) {}
      log("[knob2] pointerup/cancel");
    };
    knob2.onpointerup = end;
    knob2.onpointercancel = end;
  }

  function attachKnob2Touch() {
    knob2.style.touchAction = "auto";
    let d = false;
    let sx = 0;
    let sl = 0;
    knob2.ontouchstart = (e) => {
      d = true;
      const t = e.changedTouches[0];
      sx = t.clientX;
      sl = knob2.offsetLeft;
      log("[knob2] touchstart (touch-action:auto — page may scroll)");
    };
    knob2.ontouchmove = (e) => {
      if (!d) return;
      const t = e.changedTouches[0];
      const maxL = box2.clientWidth - knob2.clientWidth;
      const next = clamp(sl + (t.clientX - sx), 0, maxL);
      knob2.style.left = `${next}px`;
    };
    knob2.ontouchend = () => {
      d = false;
      log("[knob2] touchend");
    };
    knob2.ontouchcancel = () => {
      d = false;
      log("[knob2] touchcancel");
    };
  }

  function refreshKnob2Mode() {
    clearKnob2Handlers();
    if (usePointerEl.checked) attachKnob2Pointer();
    else attachKnob2Touch();
    knob2.style.left = "12px";
  }

  usePointerEl.addEventListener("change", refreshKnob2Mode);
  refreshKnob2Mode();
})();
