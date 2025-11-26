const canvas = document.getElementById("canvas");
const popUp = document.getElementById("pop-up");
const ctx = canvas.getContext("2d");

let mouseIn = false;
let lastId = null;
const chartData = [100, 200, 250, 100, 180, 100, 200, 250, 100, 125];

ctx.clearRect(0, 0, canvas.width, canvas.height);

const barWidth =
  400 / chartData.length - ((chartData.length - 1) * 2) / chartData.length;

const chartPostions = [];
const cornerRadius = 10;

chartData.forEach((amount, i) => {
  ctx.beginPath();
  ctx.fillStyle = i % 2 == 0 ? "#4CAF50" : "yellow";

  const x = barWidth * i + i * 2;
  const y = 300 - amount;

  ctx.moveTo(x + cornerRadius, y);
  ctx.lineTo(x + barWidth - cornerRadius, y);
  ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + cornerRadius);
  ctx.lineTo(x + barWidth, y + amount);
  ctx.lineTo(x, y + amount);
  ctx.lineTo(x, y + cornerRadius);
  ctx.quadraticCurveTo(x, y, x + cornerRadius, y);

  ctx.fill();

  chartPostions.push({
    i,
    xStart: x,
    xEnd: x + barWidth,
    yStart: y,
  });
});

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

const findId = (x, y) => {
  return chartPostions.find(
    (postion) => postion.xStart <= x && x <= postion.xEnd && postion.yStart <= y
  )?.i;
};

const clearFn = (e = null) => {
  return new Promise((resolve) => {
    if (e) {
      mouseIn = false;
      lastId = null;

      if (e?.relatedTarget == popUp) {
        resolve();
        return;
      }
    }

    popUp.style.opacity = "0";

    setTimeout(() => {
      resolve();
    }, 200);
  });
};

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
  mouseIn = false;
  clearFn(e);
});
