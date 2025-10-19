const canvas = document.getElementById("canvas");
const popUp = document.getElementById("pop-up");
const ctx = canvas.getContext("2d");

let mouseIn = false;
let lastId = null;
const chartData = [100, 200, 250, 100, 180, 100, 200, 250, 100, 100];

ctx.clearRect(0, 0, canvas.width, canvas.height);

const barWidth =
  400 / chartData.length - ((chartData.length - 1) * 2) / chartData.length;

const chartPostions = [];

chartData.forEach((amount, i) => {
  ctx.beginPath();
  ctx.fillStyle = i % 2 == 0 ? "#4CAF50" : "yellow";
  ctx.fillRect(barWidth * i + i * 2, 300 - amount, barWidth, amount);
  chartPostions.push({
    i,
    xStart: barWidth * i + i * 2,
    xEnd: barWidth * i + i * 2 + barWidth,
    yStart: 300 - amount,
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

    console.log("Clear");

    setTimeout(() => {
      if (popUp.style.opacity == "0") popUp.style.display = "none";
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

    paragraphs[0].innerText = `Element: ${id}`;
    paragraphs[1].innerText = `Amount: ${amount}`;

    const postionX = e.pageX;
    const postionY = e.pageY;
    popUp.style.display = "block";
    popUp.style.opacity = "1";
    popUp.style.left = postionX - 40 + "px";
    popUp.style.top = postionY - 50 + "px";
  }, 300)
);

canvas.addEventListener("mouseenter", () => {
  mouseIn = true;
});

canvas.addEventListener("mouseleave", (e) => {
  mouseIn = false;
  clearFn(e);
});
