/**
 * @typedef {Object} SpinState
 * @property {boolean} isHoldingSpace
 * @property {boolean} isSpinning
 * @property {number} angularVelocity
 * @property {number} rotation
 * @property {boolean} decelerating
 * @property {string|null} result
 * @property {number|null} frameHandle
 * @property {number} previousTimestamp
 */

/**
 * @typedef {Object} AppState
 * @property {"number"|"text"} mode
 * @property {number[]} numberPool
 * @property {number[]} removedNumbers
 * @property {string[]} textOptions
 * @property {(number|string)[]} wheelItems
 * @property {SpinState} spin
 * @property {number} min
 * @property {number} max
 * @property {string|null} textResult
 */

const MAX_ITEMS = 500;
const TARGET_SPIN_SPEED = 10.8;
const SPIN_ACCELERATION = 9.4;
const MIN_STOP_SPEED = 0.006;
const DECELERATION_RATE = 0.985;
const TAU = Math.PI * 2;

const refs = {
  tabNumber: document.getElementById("tab-number"),
  tabText: document.getElementById("tab-text"),
  panelNumber: document.getElementById("panel-number"),
  panelText: document.getElementById("panel-text"),
  minInput: document.getElementById("number-min"),
  maxInput: document.getElementById("number-max"),
  applyRangeBtn: document.getElementById("apply-range"),
  resetNumberBtn: document.getElementById("reset-number-mode"),
  numberError: document.getElementById("number-error"),
  textOptions: document.getElementById("text-options"),
  applyOptionsBtn: document.getElementById("apply-options"),
  resetScratchBtn: document.getElementById("reset-scratch"),
  clearTextBtn: document.getElementById("clear-text-options"),
  textError: document.getElementById("text-error"),
  wheelSection: document.getElementById("wheel-section"),
  wheelFocus: document.getElementById("wheel-focus"),
  canvas: document.getElementById("wheel"),
  scratchSection: document.getElementById("scratch-section"),
  scratchCanvas: document.getElementById("scratch-canvas"),
  scratchResult: document.getElementById("scratch-result"),
  statusRow: document.getElementById("status-row"),
  status: document.getElementById("spin-status"),
  result: document.getElementById("spin-result"),
  historyPanel: document.getElementById("history-panel"),
  removedList: document.getElementById("removed-list"),
};

const ctx = refs.canvas.getContext("2d");
const scratchCtx = refs.scratchCanvas.getContext("2d");

/** @type {AppState} */
const state = {
  mode: "number",
  numberPool: [],
  removedNumbers: [],
  textOptions: [],
  wheelItems: [],
  min: 0,
  max: 100,
  textResult: null,
  spin: {
    isHoldingSpace: false,
    isSpinning: false,
    angularVelocity: 0,
    rotation: 0,
    decelerating: false,
    result: null,
    frameHandle: null,
    previousTimestamp: 0,
  },
};

const scratchState = {
  enabled: false,
  scratching: false,
};

init();

function init() {
  bindEvents();
  applyNumberRange();
  resetScratchSurface("Click \"Reset Scratch Card\" to pick random text.");
  renderMode();
}

function bindEvents() {
  refs.tabNumber.addEventListener("click", () => switchMode("number"));
  refs.tabText.addEventListener("click", () => switchMode("text"));

  refs.applyRangeBtn.addEventListener("click", () => {
    if (ensureNotSpinning()) {
      applyNumberRange();
    }
  });

  refs.resetNumberBtn.addEventListener("click", () => {
    if (!ensureNotSpinning()) {
      return;
    }
    refs.numberError.textContent = "";
    applyNumberRange();
    refs.status.textContent = "Ready";
    refs.result.textContent = "None";
  });

  refs.applyOptionsBtn.addEventListener("click", applyTextOptions);
  refs.resetScratchBtn.addEventListener("click", () => {
    if (!applyTextOptions()) {
      refs.status.textContent = "Stopped";
      return;
    }

    const randomIndex = Math.floor(Math.random() * state.textOptions.length);
    state.textResult = state.textOptions[randomIndex];
    resetScratchSurface(state.textResult);
    refs.status.textContent = "Scratch to reveal";
  });

  refs.clearTextBtn.addEventListener("click", () => {
    refs.textOptions.value = "";
    refs.textError.textContent = "";
    state.textOptions = [];
    state.textResult = null;
    refs.status.textContent = "Ready";
    refs.result.textContent = "None";
    resetScratchSurface("Click \"Reset Scratch Card\" to pick random text.");
  });

  refs.wheelFocus.addEventListener("keydown", (event) => {
    if (event.code !== "Space") {
      return;
    }
    event.preventDefault();
    if (event.repeat) {
      return;
    }
    onSpaceDown();
  });

  refs.wheelFocus.addEventListener("keyup", (event) => {
    if (event.code !== "Space") {
      return;
    }
    event.preventDefault();
    onSpaceUp();
  });

  refs.scratchCanvas.addEventListener("pointerdown", (event) => {
    if (!scratchState.enabled) {
      return;
    }
    scratchState.scratching = true;
    scratchAtEvent(event);
  });

  refs.scratchCanvas.addEventListener("pointermove", (event) => {
    if (!scratchState.enabled || !scratchState.scratching) {
      return;
    }
    scratchAtEvent(event);
  });

  refs.scratchCanvas.addEventListener("pointerup", () => {
    scratchState.scratching = false;
  });

  refs.scratchCanvas.addEventListener("pointerleave", () => {
    scratchState.scratching = false;
  });

  refs.scratchCanvas.addEventListener("pointercancel", () => {
    scratchState.scratching = false;
  });

  window.addEventListener("blur", () => {
    if (state.spin.isHoldingSpace) {
      onSpaceUp();
    }
    scratchState.scratching = false;
  });
}

function switchMode(mode) {
  if (mode === state.mode || !ensureNotSpinning()) {
    return;
  }

  state.mode = mode;
  refs.numberError.textContent = "";
  refs.textError.textContent = "";

  if (mode === "number") {
    if (!state.numberPool.length) {
      applyNumberRange();
    } else {
      state.wheelItems = [...state.numberPool];
      drawWheel();
    }
    refs.status.textContent = "Ready";
    refs.result.textContent = "None";
  } else {
    refs.status.textContent = state.textResult ? "Scratch to reveal" : "Ready";
    refs.result.textContent = "Hidden";
  }

  renderMode();
}

function renderMode() {
  const isNumber = state.mode === "number";

  refs.tabNumber.classList.toggle("active", isNumber);
  refs.tabText.classList.toggle("active", !isNumber);
  refs.tabNumber.setAttribute("aria-pressed", String(isNumber));
  refs.tabText.setAttribute("aria-pressed", String(!isNumber));

  refs.panelNumber.classList.toggle("active", isNumber);
  refs.panelText.classList.toggle("active", !isNumber);
  refs.panelNumber.hidden = !isNumber;
  refs.panelText.hidden = isNumber;

  refs.historyPanel.hidden = !isNumber;
  refs.wheelSection.hidden = !isNumber;
  refs.scratchSection.hidden = isNumber;
  refs.statusRow.hidden = !isNumber;

  if (isNumber) {
    state.wheelItems = [...state.numberPool];
    drawWheel();
  }
}

function applyNumberRange() {
  const minValue = Number(refs.minInput.value);
  const maxValue = Number(refs.maxInput.value);

  const validation = validateNumberRange(minValue, maxValue);
  if (!validation.ok) {
    refs.numberError.textContent = validation.error;
    if (state.mode === "number") {
      state.wheelItems = [];
      drawWheel();
    }
    return;
  }

  refs.numberError.textContent = "";
  state.min = minValue;
  state.max = maxValue;
  state.numberPool = buildNumberPool(minValue, maxValue);
  state.removedNumbers = [];
  renderRemovedNumbers();

  if (state.mode === "number") {
    state.wheelItems = [...state.numberPool];
    refs.status.textContent = "Ready";
    refs.result.textContent = "None";
    drawWheel();
  }
}

function validateNumberRange(minValue, maxValue) {
  if (!Number.isInteger(minValue) || !Number.isInteger(maxValue)) {
    return { ok: false, error: "Min and max must be integers." };
  }

  if (minValue > maxValue) {
    return { ok: false, error: "Min must be less than or equal to max." };
  }

  const count = maxValue - minValue + 1;
  if (count < 2) {
    return { ok: false, error: "Range must contain at least 2 numbers to spin." };
  }

  if (count > MAX_ITEMS) {
    return { ok: false, error: `Range is too large. Maximum is ${MAX_ITEMS} items.` };
  }

  return { ok: true, error: "" };
}

function buildNumberPool(min, max) {
  const output = [];
  for (let n = min; n <= max; n += 1) {
    output.push(n);
  }
  return output;
}

function renderRemovedNumbers() {
  refs.removedList.innerHTML = "";
  if (!state.removedNumbers.length) {
    const li = document.createElement("li");
    li.textContent = "No numbers removed yet.";
    refs.removedList.appendChild(li);
    return;
  }

  for (const value of state.removedNumbers) {
    const li = document.createElement("li");
    li.textContent = String(value);
    refs.removedList.appendChild(li);
  }
}

function applyTextOptions() {
  const lines = refs.textOptions.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    refs.textError.textContent = "Enter at least 2 options (one per line).";
    return false;
  }

  const uniqueCount = new Set(lines).size;
  if (uniqueCount < 2) {
    refs.textError.textContent = "Enter at least 2 distinct options.";
    return false;
  }

  if (lines.length > MAX_ITEMS) {
    refs.textError.textContent = `Too many options. Maximum is ${MAX_ITEMS}.`;
    return false;
  }

  refs.textError.textContent = "";
  state.textOptions = [...lines];
  state.textResult = null;
  resetScratchSurface("Click \"Reset Scratch Card\" to pick random text.");

  if (state.mode === "text") {
    refs.status.textContent = "Ready";
    refs.result.textContent = "Hidden";
  }

  return true;
}

function resetScratchSurface(text) {
  refs.scratchResult.textContent = text;
  drawScratchCover();
  scratchState.enabled = Boolean(state.textResult);
}

function drawScratchCover() {
  const width = refs.scratchCanvas.width;
  const height = refs.scratchCanvas.height;

  scratchCtx.save();
  scratchCtx.globalCompositeOperation = "source-over";
  scratchCtx.clearRect(0, 0, width, height);

  const gradient = scratchCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#8f98a7");
  gradient.addColorStop(0.5, "#c4cbd8");
  gradient.addColorStop(1, "#8a95a4");

  scratchCtx.fillStyle = gradient;
  scratchCtx.fillRect(0, 0, width, height);

  scratchCtx.fillStyle = "rgba(255, 255, 255, 0.86)";
  scratchCtx.font = "700 34px Avenir Next";
  scratchCtx.textAlign = "center";
  scratchCtx.textBaseline = "middle";
  scratchCtx.fillText("Scratch Here", width / 2, height / 2);
  scratchCtx.restore();
}

function scratchAtEvent(event) {
  const rect = refs.scratchCanvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * refs.scratchCanvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * refs.scratchCanvas.height;

  scratchCtx.save();
  scratchCtx.globalCompositeOperation = "destination-out";
  scratchCtx.beginPath();
  scratchCtx.arc(x, y, 26, 0, TAU);
  scratchCtx.fill();
  scratchCtx.restore();
}

function canSpin() {
  return state.mode === "number" && state.wheelItems.length >= 2;
}

function ensureNotSpinning() {
  if (state.spin.isSpinning || state.spin.decelerating || state.spin.isHoldingSpace) {
    return false;
  }
  return true;
}

function onSpaceDown() {
  if (state.mode !== "number") {
    return;
  }

  if (!canSpin()) {
    refs.status.textContent = "Stopped";
    refs.result.textContent = "Number pool empty or invalid range";
    if (!state.numberPool.length) {
      refs.numberError.textContent = "No numbers left. Reset Number Mode to continue.";
    }
    return;
  }

  state.spin.isHoldingSpace = true;
  state.spin.decelerating = false;
  state.spin.isSpinning = true;
  state.spin.angularVelocity = Math.max(state.spin.angularVelocity, TARGET_SPIN_SPEED * 0.35);
  refs.status.textContent = "Spinning";

  if (state.spin.frameHandle === null) {
    state.spin.previousTimestamp = 0;
    state.spin.frameHandle = requestAnimationFrame(animationTick);
  }
}

function onSpaceUp() {
  if (!state.spin.isHoldingSpace) {
    return;
  }
  state.spin.isHoldingSpace = false;
  if (state.spin.isSpinning) {
    state.spin.decelerating = true;
    refs.status.textContent = "Slowing down";
  }
}

function animationTick(timestamp) {
  if (!state.spin.previousTimestamp) {
    state.spin.previousTimestamp = timestamp;
  }

  const deltaSeconds = Math.min((timestamp - state.spin.previousTimestamp) / 1000, 0.05);
  state.spin.previousTimestamp = timestamp;

  if (state.spin.isHoldingSpace) {
    state.spin.angularVelocity = Math.min(
      TARGET_SPIN_SPEED,
      state.spin.angularVelocity + SPIN_ACCELERATION * deltaSeconds
    );
  } else if (state.spin.decelerating) {
    state.spin.angularVelocity *= Math.pow(DECELERATION_RATE, deltaSeconds * 60);
    if (state.spin.angularVelocity <= MIN_STOP_SPEED) {
      state.spin.angularVelocity = 0;
      state.spin.decelerating = false;
      state.spin.isSpinning = false;
      onSpinStop();
    }
  }

  if (state.spin.angularVelocity > 0) {
    state.spin.rotation += state.spin.angularVelocity * deltaSeconds;
    state.spin.rotation %= TAU;
    drawWheel();
  }

  if (state.spin.isSpinning || state.spin.decelerating || state.spin.isHoldingSpace) {
    state.spin.frameHandle = requestAnimationFrame(animationTick);
  } else {
    state.spin.frameHandle = null;
    state.spin.previousTimestamp = 0;
  }
}

function onSpinStop() {
  if (!state.wheelItems.length) {
    refs.status.textContent = "Stopped";
    refs.result.textContent = "None";
    drawWheel();
    return;
  }

  const selectedIndex = pickWinningIndex(state.wheelItems.length, state.spin.rotation);
  const selectedItem = state.wheelItems[selectedIndex];
  state.spin.result = String(selectedItem);
  refs.status.textContent = "Stopped";
  refs.result.textContent = state.spin.result;

  const numValue = Number(selectedItem);
  state.numberPool = state.numberPool.filter((n) => n !== numValue);
  state.removedNumbers.push(numValue);
  renderRemovedNumbers();

  if (!state.numberPool.length) {
    refs.numberError.textContent = "All numbers have been drawn. Reset Number Mode to continue.";
    state.wheelItems = [];
    drawWheel();
    return;
  }

  state.wheelItems = [...state.numberPool];
  drawWheel();
}

function pickWinningIndex(itemCount, rotation) {
  const segmentAngle = TAU / itemCount;
  const pointerAngle = -Math.PI / 2;
  const adjustedAngle = normalizeAngle(pointerAngle - rotation);
  const index = Math.floor(adjustedAngle / segmentAngle);
  return clamp(index, 0, itemCount - 1);
}

function normalizeAngle(angle) {
  let normalized = angle % TAU;
  if (normalized < 0) {
    normalized += TAU;
  }
  return normalized;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drawWheel() {
  const width = refs.canvas.width;
  const height = refs.canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 8;

  ctx.clearRect(0, 0, width, height);

  if (!state.wheelItems.length) {
    drawEmptyWheel(cx, cy, radius);
    return;
  }

  const items = state.wheelItems;
  const slice = TAU / items.length;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(state.spin.rotation);

  for (let i = 0; i < items.length; i += 1) {
    const start = i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = wheelColor(i);
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    drawLabel(items[i], start, slice, radius);
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.13, 0, TAU);
  ctx.fillStyle = "#19243a";
  ctx.fill();

  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#19243a";
  ctx.stroke();
}

function drawEmptyWheel(cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.fillStyle = "#dce1ec";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#8d97ad";
  ctx.stroke();

  ctx.fillStyle = "#3d475e";
  ctx.font = "700 24px Avenir Next";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("No Items", cx, cy);
}

function wheelColor(index) {
  if (isWheelInMotion()) {
    return index % 2 === 0 ? "#50535b" : "#c7ccd6";
  }
  const hue = (index * 37) % 360;
  return `hsl(${hue} 72% 56%)`;
}

function isWheelInMotion() {
  return state.mode === "number" && (state.spin.isHoldingSpace || state.spin.isSpinning || state.spin.decelerating);
}

function drawLabel(rawValue, startAngle, sliceAngle, radius) {
  const value = String(rawValue);

  if (sliceAngle < 0.06) {
    return;
  }

  const angle = startAngle + sliceAngle / 2;
  const textRadius = radius * 0.7;

  ctx.save();
  ctx.rotate(angle);
  ctx.translate(textRadius, 0);
  ctx.rotate(Math.PI / 2);

  const maxChars = sliceAngle < 0.22 ? 5 : sliceAngle < 0.32 ? 9 : 14;
  const text = value.length > maxChars ? `${value.slice(0, maxChars - 1)}...` : value;

  ctx.fillStyle = "#111827";
  ctx.font = `700 ${sliceAngle < 0.14 ? 12 : 14}px Avenir Next`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
