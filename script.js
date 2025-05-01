
const soldNumbers = [5,8,24,25,26,27,11,12,15,17,92,98];

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
