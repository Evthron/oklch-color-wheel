const canvas = document.getElementById('colorWheel');
const ctx = canvas.getContext('2d');
const center = { x: 300, y: 300 };
const outerRadius = 300;
const innerRadius = 150;
const gapWidth = 8;

// Control elements
const lControl = document.getElementById('lControl');
const cControl = document.getElementById('cControl');
const rotationControl = document.getElementById('rotationControl');
const grayControl = document.getElementById('grayControl');
const hueOffsetControl = document.getElementById('hueOffsetControl');
const lValue = document.getElementById('lValue');
const cValue = document.getElementById('cValue');
const rotationValue = document.getElementById('rotationValue');
const grayValue = document.getElementById('grayValue');
const hueOffsetValue = document.getElementById('hueOffsetValue');

// State
let params = {
  l: 0.75,
  c: 0.12,
  grayL: 0.5,
  hueOffset: 0,
  rotation: 0,
  isDragging: false,
  startAngle: 0
};

// Initialize
function init() {
  lControl.addEventListener('input', updateParams);
  cControl.addEventListener('input', updateParams);
  rotationControl.addEventListener('input', updateParams);
  grayControl.addEventListener('input', updateParams);
  hueOffsetControl.addEventListener('input', updateParams);
  
  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('mousemove', drag);
  canvas.addEventListener('mouseup', endDrag);
  canvas.addEventListener('mouseleave', endDrag);
  
  updateParams();
}

function updateParams() {
  params.l = parseFloat(lControl.value);
  params.c = parseFloat(cControl.value);
  params.rotation = parseInt(rotationControl.value);
  params.grayL = parseFloat(grayControl.value);
  params.hueOffset = parseInt(hueOffsetControl.value);
  
  lValue.textContent = params.l.toFixed(2);
  cValue.textContent = params.c.toFixed(2);
  rotationValue.textContent = params.rotation;
  grayValue.textContent = params.grayL.toFixed(2);
  hueOffsetValue.textContent = params.hueOffset;
  document.body.style.backgroundColor = `oklch(${params.grayL} 0 0)`;
  
  drawColorWheel();
}

function startDrag(e) {
  params.isDragging = true;
  params.startAngle = getAngle(e) - params.rotation;
}

function drag(e) {
  if (!params.isDragging) return;
  const angle = getAngle(e);
  params.rotation = angle - params.startAngle;
  rotationControl.value = params.rotation;
  updateParams();
}

function endDrag() {
  params.isDragging = false;
}

function getAngle(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - center.x;
  const y = e.clientY - rect.top - center.y;
  return Math.atan2(y, x) * 180 / Math.PI;
}

function drawColorWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background
  ctx.fillStyle = `oklch(${params.grayL} 0 0)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Apply rotation
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(params.rotation * Math.PI / 180);
  ctx.translate(-center.x, -center.y);
  
  // Draw color wheel
  const segmentAngle = (Math.PI * 2) / 12;
  const colourOffset = 4;

  for (let i = 0; i < 12; i++) {
    // Calculate hue with offset (0-360)
    const hue = (i * 30 + params.hueOffset + colourOffset * 30) % 360;
  
    // Draw colored segment
    ctx.fillStyle = `oklch(${params.l} ${params.c} ${hue})`;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(
      center.x, center.y,
      outerRadius,
      i * segmentAngle,
      (i + 1) * segmentAngle
    );
    ctx.lineTo(
      center.x + innerRadius * Math.cos((i + 1) * segmentAngle),
      center.y + innerRadius * Math.sin((i + 1) * segmentAngle)
    );
    ctx.arc(
      center.x, center.y,
      innerRadius,
      (i + 1) * segmentAngle,
      i * segmentAngle,
      true
    );
    ctx.closePath();
    ctx.fill();
    
    // Draw gray separator (on the right side of each segment)
    ctx.fillStyle = `oklch(${params.grayL} 0 0)`;
    ctx.beginPath();
    
    const angle = (i + 1) * segmentAngle; // Fixed on the right side of the segment
    const tangentX = -Math.sin(angle);
    const tangentY = Math.cos(angle);
    const offset = gapWidth / 2;
    const newOuterRadius = innerRadius + (outerRadius - innerRadius) * 7/8; // Shrink outer radius
 
    // Calculate four vertices
    const outerStart = {
      x: center.x + newOuterRadius * Math.cos(angle) - tangentX * offset,
      y: center.y + newOuterRadius * Math.sin(angle) - tangentY * offset
    };
    const outerEnd = {
      x: center.x + newOuterRadius * Math.cos(angle) + tangentX * offset,
      y: center.y + newOuterRadius * Math.sin(angle) + tangentY * offset
    };
    const innerStart = {
      x: center.x + innerRadius * Math.cos(angle) - tangentX * offset,
      y: center.y + innerRadius * Math.sin(angle) - tangentY * offset
    };
    const innerEnd = {
      x: center.x + innerRadius * Math.cos(angle) + tangentX * offset,
      y: center.y + innerRadius * Math.sin(angle) + tangentY * offset
    };
 
    // Draw rectangle path
    ctx.moveTo(outerStart.x, outerStart.y);
    ctx.lineTo(outerEnd.x, outerEnd.y);
    ctx.lineTo(innerEnd.x, innerEnd.y);
    ctx.lineTo(innerStart.x, innerStart.y);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// Start
init();
