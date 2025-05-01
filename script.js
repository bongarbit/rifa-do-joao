
const soldNumbers = [3, 13, 14, 15, 16, 22, 23, 24, 25, 26, 33, 34, 35, 36, 37, 64, 65, 66, 92, 93, 98];

function renderGrid() {
  const grid = document.getElementById("grid");
  for (let i = 1; i <= 100; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (soldNumbers.includes(i)) {
      btn.className = "sold";
      btn.disabled = true;
    } else {
      btn.className = "available";
    }
    grid.appendChild(btn);
  }
}

renderGrid();
