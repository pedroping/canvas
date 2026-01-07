const canvas = document.getElementById("canvas");
const popUp = document.getElementById("pop-up");
const ctx = canvas.getContext("2d");

const cornerRadius = 10;
const animationSpeed = 0.15;
const maxDarkness = 0.1;

let mouseIn = false;
let lastId = null;
let activeBarIndex = -1;
const chartData = [100, 200, 250, 100, 180, 100, 200, 250, 100, 125];

let barHoverStates = new Array(chartData.length).fill(0);

const barWidth =
  400 / chartData.length - ((chartData.length - 1) * 2) / chartData.length;
const chartPositions = [];

chartData.forEach((amount, i) => {
  const x = barWidth * i + i * 2;
  const y = 300 - amount;

  chartPositions.push({
    i,
    amount,
    xStart: x,
    xEnd: x + barWidth,
    yStart: y,
  });
});

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  chartPositions.forEach((pos, i) => {
    ctx.fillStyle = i % 2 == 0 ? "#4CAF50" : "yellow";
    drawRoundedRect(
      ctx,
      pos.xStart,
      pos.yStart,
      barWidth,
      pos.amount,
      cornerRadius
    );
    ctx.fill();

    if (barHoverStates[i] > 0.01) {
      const alpha = barHoverStates[i] * maxDarkness;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      drawRoundedRect(
        ctx,
        pos.xStart,
        pos.yStart,
        barWidth,
        pos.amount,
        cornerRadius
      );
      ctx.fill();
    }
  });
}

draw();

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function animate() {
  let needsRedraw = false;

  for (let i = 0; i < chartPositions.length; i++) {
    const target = i === activeBarIndex ? 1 : 0;
    const diff = target - barHoverStates[i];

    if (Math.abs(diff) > 0.001) {
      barHoverStates[i] = lerp(barHoverStates[i], target, animationSpeed);
      needsRedraw = true;
    } else {
      barHoverStates[i] = target;
    }
  }

  if (needsRedraw) {
    draw();
  }

  requestAnimationFrame(animate);
}

animate();

const findId = (x, y) => {
  return chartPositions.find(
    (pos) => pos.xStart <= x && x <= pos.xEnd && pos.yStart <= y
  )?.i;
};

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

const clearFn = (e = null) => {
  return new Promise((resolve) => {
    if (e) {
      if (e?.relatedTarget == popUp) return resolve();

      mouseIn = false;
      lastId = null;
      activeBarIndex = -1;
    }
    popUp.style.opacity = "0";
    setTimeout(() => {
      resolve();
    }, 200);
  });
};

canvas.addEventListener("mousemove", (e) => {
  if (!mouseIn) return;
  const id = findId(e.offsetX, e.offsetY);
  activeBarIndex = id !== undefined ? id : -1;
});

canvas.addEventListener(
  "mousemove",
  debounce(async (e) => {
    if (!mouseIn) return;

    const id = findId(e.offsetX, e.offsetY);

    if (id == undefined || id === -1) return await clearFn();
    if (id == lastId) return;

    await clearFn();

    lastId = id;

    const amount = chartData[id];
    const paragraphs = popUp.querySelectorAll("p");

    paragraphs[0].innerText = `Element: ${id + 1}`;
    paragraphs[1].innerText = `Amount: ${amount}`;

    const postionX = e.pageX;
    const postionY = e.pageY;
    popUp.style.opacity = "1";
    popUp.style.left = postionX - 40 + "px";
    popUp.style.top = postionY - 50 + "px";
  }, 100)
);

canvas.addEventListener("mouseenter", () => {
  mouseIn = true;
});

canvas.addEventListener("mouseleave", (e) => {
  clearFn(e);
});

popUp.addEventListener("mouseleave", (e) => {
  if (e?.toElement == canvas) return;

  mouseIn = false;
  lastId = null;
  activeBarIndex = -1;
  popUp.style.opacity = "0";
});
