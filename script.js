
const soldNumbers = [5,8,24,25,26,27,11,12,15,16,17,92,98,33,35,37,40,51,54,56,77,66,53,57,99,88,20,25,59,3,13,21,52,14,61,2,4,6,7,9,10,43,55,63,71,79,87,95,38,70,100,94];
const selectedNumbers = [];

function renderGrid() {
  const grid = document.getElementById("grid");
  for (let i = 1; i <= 100; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.dataset.number = i;
    if (soldNumbers.includes(i)) {
      btn.className = "sold";
      btn.disabled = true;
    } else {
      btn.className = "available";
      btn.onclick = () => toggleNumber(i, btn);
    }
    grid.appendChild(btn);
  }
}

function toggleNumber(number, btn) {
  const index = selectedNumbers.indexOf(number);
  if (index === -1) {
    selectedNumbers.push(number);
    btn.style.backgroundColor = "#4fa3d1";
    btn.style.color = "#fff";
  } else {
    selectedNumbers.splice(index, 1);
    btn.style.backgroundColor = "#eee";
    btn.style.color = "#000";
  }

  updateWhatsAppLink();
}

function updateWhatsAppLink() {
  let link = document.getElementById("whats-link");
  if (!link) {
    link = document.createElement("a");
    link.id = "whats-link";
    link.textContent = "Enviar pedido via WhatsApp";
    
    link.style.display = "inline-block";
    link.style.backgroundColor = "#25D366";
    link.style.color = "#fff";
    link.style.padding = "10px 20px";
    link.style.borderRadius = "8px";
    link.style.fontSize = "16px";
    link.style.border = "none";
    link.style.margin = "20px auto 0";
    link.style.textAlign = "center";
    
    link.style.marginTop = "20px";
    link.style.fontWeight = "bold";
    link.style.textDecoration = "none";
    link.style.color = "#25D366";
    document.querySelector(".legend").insertAdjacentElement("afterend", link);
  }

  if (selectedNumbers.length === 0) {
    link.style.display = "none";
    return;
  }

  const total = selectedNumbers.length * 10;
  const message = `Olá! Gostaria de reservar os números: ${selectedNumbers.sort((a,b)=>a-b).join(", ")} da rifa do João. Já fiz o PIX para joao-vitor-veras-dos@jim.com no valor de R$${total},00.`;
  const encoded = encodeURIComponent(message);
  link.href = `https://wa.me/5581997313904?text=${encoded}`;
  
    link.style.display = "inline-block";
    link.style.backgroundColor = "#25D366";
    link.style.color = "#fff";
    link.style.padding = "10px 20px";
    link.style.borderRadius = "8px";
    link.style.fontSize = "16px";
    link.style.border = "none";
    link.style.margin = "20px auto 0";
    link.style.textAlign = "center";
    
}

renderGrid();
