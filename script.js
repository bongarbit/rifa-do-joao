// Troque pelo ID real da sua planilha Google Sheets.
const SHEET_ID = "1DIxTmfwUAHnC2vf2_L8zT5upEh4JgHysrFn0BSDig6w";
// GID da aba da rifa (normalmente 0 para a primeira aba).
const SHEET_GID = "0";

const TOTAL_NUMBERS = 70;
const NUMBER_PRICE = 10;
const WHATSAPP_PHONE = "5581997313904";
const PIX_KEY = "joao-vitor-veras-dos@jim.com";

const soldCounterEl = document.getElementById("soldCounter");
const raisedCounterEl = document.getElementById("raisedCounter");
const numbersGridEl = document.getElementById("numbersGrid");
const loadingMessageEl = document.getElementById("loadingMessage");
const shareBtn = document.getElementById("shareBtn");
const sendBar = document.getElementById("sendBar");
const sendBarCount = document.getElementById("sendBarCount");
const sendBarTotal = document.getElementById("sendBarTotal");
const sendBarBtn = document.getElementById("sendBarBtn");

const selectedNumbers = new Set();

init();

async function init() {
  setupShareButton();
  setupSendBar();
  await loadRaffleData();
}

async function loadRaffleData() {
  try {
    if (!SHEET_ID || SHEET_ID === "SEU_ID_AQUI") {
      throw new Error("SHEET_ID não configurado.");
    }

    const records = await fetchSheetRowsByJsonp();
    if (!records.length) {
      throw new Error("A aba existe, mas não retornou linhas.");
    }

    const raffleData = normalizeRaffleData(records);

    renderNumbersGrid(raffleData);
    updateCounters(raffleData);
  } catch (error) {
    console.error(error);
    showLoadError(error.message);
  }
}

function fetchSheetRowsByJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = `rifaSheetCallback_${Date.now()}`;
    const queryUrl =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
      `?gid=${encodeURIComponent(SHEET_GID)}` +
      `&headers=1` +
      `&tqx=${encodeURIComponent(`out:json;responseHandler:${callbackName}`)}`;

    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timeout ao consultar planilha."));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (response) => {
      cleanup();
      try {
        const table = response?.table;
        const rows = table?.rows || [];

        const records = rows.map((row) => ({
          numero: row?.c?.[0]?.v,
          vendido: row?.c?.[1]?.v
        }));

        resolve(records);
      } catch (error) {
        reject(new Error(`Resposta inválida da planilha. (${error.message})`));
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Falha de rede ao consultar Google Sheets."));
    };

    script.src = queryUrl;
    document.head.appendChild(script);
  });
}

function normalizeRaffleData(records) {
  const dataMap = new Map();

  records.forEach((record) => {
    const num = Number(record.numero);
    if (!Number.isInteger(num) || num < 1 || num > TOTAL_NUMBERS) return;

    const sold = String(record.vendido).toUpperCase() === "TRUE" || record.vendido === true;
    dataMap.set(num, sold);
  });

  const fullList = [];
  for (let i = 1; i <= TOTAL_NUMBERS; i += 1) {
    fullList.push({
      numero: i,
      vendido: dataMap.get(i) || false
    });
  }

  return fullList;
}

function renderNumbersGrid(raffleData) {
  if (loadingMessageEl) loadingMessageEl.remove();
  numbersGridEl.innerHTML = "";

  raffleData.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("number-btn");
    button.dataset.numero = item.numero;

    if (item.vendido) {
      button.classList.add("sold");
      button.disabled = true;
      button.textContent = `${formatNumber(item.numero)}\nVENDIDO`;
      button.setAttribute("aria-label", `Número ${formatNumber(item.numero)} vendido`);
    } else {
      button.classList.add("available");
      button.textContent = formatNumber(item.numero);
      button.setAttribute("aria-label", `Selecionar número ${formatNumber(item.numero)}`);
      button.addEventListener("click", () => toggleSelection(item.numero, button));
    }

    numbersGridEl.appendChild(button);
  });
}

function toggleSelection(numero, button) {
  if (selectedNumbers.has(numero)) {
    selectedNumbers.delete(numero);
    button.classList.remove("selected");
    button.classList.add("available");
  } else {
    selectedNumbers.add(numero);
    button.classList.remove("available");
    button.classList.add("selected");
  }
  updateSendBar();
}

function updateSendBar() {
  const count = selectedNumbers.size;
  const total = count * NUMBER_PRICE;

  sendBarCount.textContent = count === 1
    ? "1 número selecionado"
    : `${count} números selecionados`;
  sendBarTotal.textContent = `Total: ${formatCurrency(total)}`;

  if (count > 0) {
    sendBar.classList.add("visible");
  } else {
    sendBar.classList.remove("visible");
  }
}

function adjustSendBar() {
  const narrow = window.innerWidth < 480;
  sendBar.style.flexDirection = narrow ? "column" : "row";
  sendBar.style.alignItems = narrow ? "stretch" : "center";
  sendBarBtn.style.width = narrow ? "100%" : "auto";
  sendBarBtn.style.fontSize = narrow ? "0.9rem" : "";
  sendBarBtn.style.padding = narrow ? "12px 16px" : "";
}

function setupSendBar() {
  adjustSendBar();
  window.addEventListener("resize", adjustSendBar);

  sendBarBtn.addEventListener("click", () => {
    if (selectedNumbers.size === 0) return;

    const sorted = Array.from(selectedNumbers).sort((a, b) => a - b);
    const formatted = sorted.map(formatNumber).join(", ");
    const count = sorted.length;
    const total = count * NUMBER_PRICE;
    const totalStr = formatCurrency(total);

    const msg =
      `Oi! Quero comprar ${count === 1 ? "o número" : "os números"} ${formatted} da rifa para contribuir para a tua viagem pedagógica.\n\n` +
      `Valor total: ${totalStr} (${count} × R$${NUMBER_PRICE},00)\n\n` +
      `Vou fazer o PIX para a chave ${PIX_KEY} e encaminhar o comprovante de transferência aqui na conversa assim que realizar o pagamento`;

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  });
}

function updateCounters(raffleData) {
  const soldCount = raffleData.filter((item) => item.vendido).length;
  const raisedValue = soldCount * NUMBER_PRICE;

  soldCounterEl.textContent = `Números vendidos: ${soldCount} / ${TOTAL_NUMBERS}`;
  raisedCounterEl.textContent = `Valor arrecadado: ${formatCurrency(raisedValue)}`;
}

function setupShareButton() {
  shareBtn.addEventListener("click", async () => {
    const shareText =
      "Ajude a viagem pedagógica de Joãozinho da Xambá\n\n" +
      "Compre um número da rifa por R$10 e concorra a um Ovo de Páscoa!\n\n" +
      "Link:";
    const shareData = {
      title: "Rifa Solidária - Viagem Pedagógica IC",
      text: `${shareText}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        alert("Link copiado para compartilhar.");
      }
    } catch (error) {
      console.error("Falha ao compartilhar:", error);
    }
  });
}

function showLoadError(reason) {
  numbersGridEl.innerHTML =
    `<p class="error">Não foi possível carregar os números da rifa.<br>${reason}<br><br>Dica: confira se a planilha está como "qualquer pessoa com o link pode visualizar".</p>`;
}

function formatNumber(value) {
  return String(value).padStart(2, "0");
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
