// ==========================================
// CONFIGURAÇÕES DA ORGANIZAÇÃO
// ==========================================
const ORGANIZER_WHATSAPP = "5547989037974"; 
const PIX_KEY = "proffnilvia.rg64@gmail.com";
const ADMIN_PASSWORD = "20012027"; 

// LISTA DE NÚMEROS VENDIDOS OFICIAIS PARA O GITHUB:
// Adicione aqui os números já vendidos para que apareçam bloqueados para todos os visitantes
const INITIAL_SOLD_NUMBERS = []; 

// ==========================================
// LÓGICA DO SISTEMA
// ==========================================
let savedData = localStorage.getItem('rede_solidaria_sold_numbers');
let soldNumbers = savedData !== null ? JSON.parse(savedData) : [...INITIAL_SOLD_NUMBERS];
let tempSoldNumbers = [];
let selectedNumber = null;

const numberGrid = document.getElementById('numberGrid');
const managerNumberGrid = document.getElementById('managerNumberGrid');
const freeCountDisplay = document.getElementById('freeCountDisplay');
const formTitle = document.getElementById('formTitle');
const submitWhatsappBtn = document.getElementById('submitWhatsappBtn');
const whatsappForm = document.getElementById('whatsappForm');
const fullNameInput = document.getElementById('fullNameInput');
const phoneInput = document.getElementById('phoneInput');

const publicView = document.getElementById('publicView');
const managerView = document.getElementById('managerView');
const manageNumbersBtn = document.getElementById('manageNumbersBtn');
const closeManagerBtn = document.getElementById('closeManagerBtn');
const saveManagerBtn = document.getElementById('saveManagerBtn');

const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const closeMessageBtn = document.getElementById('closeMessageBtn');

const fmt = n => String(n).padStart(3, '0');

function showMessage(text, isSuccess = false) {
  messageText.textContent = text;
  messageBox.className = `notice ${isSuccess ? 'success' : ''}`;
  messageBox.style.display = 'flex';
}

closeMessageBtn.addEventListener('click', () => {
  messageBox.style.display = 'none';
});

function renderPublicGrid() {
  numberGrid.innerHTML = '';
  let availableCount = 0;

  for (let i = 1; i <= 300; i++) {
    const isSold = soldNumbers.includes(i);
    if (!isSold) availableCount++;

    const btn = document.createElement('button');
    btn.className = `number ${isSold ? 'taken' : ''} ${selectedNumber === i ? 'chosen' : ''}`;
    btn.disabled = isSold;
    btn.textContent = fmt(i);

    btn.addEventListener('click', () => {
      selectedNumber = selectedNumber === i ? null : i;
      formTitle.textContent = selectedNumber 
        ? `Número ${fmt(selectedNumber)} selecionado` 
        : 'Finalize sua escolha';
      submitWhatsappBtn.disabled = !selectedNumber;
      renderPublicGrid();
    });

    numberGrid.appendChild(btn);
  }

  freeCountDisplay.textContent = availableCount;
}

function renderManagerGrid() {
  managerNumberGrid.innerHTML = '';

  for (let i = 1; i <= 300; i++) {
    const isSold = tempSoldNumbers.includes(i);

    const btn = document.createElement('button');
    btn.className = `number ${isSold ? 'taken' : ''}`;
    btn.textContent = fmt(i);

    btn.addEventListener('click', () => {
      if (isSold) {
        tempSoldNumbers = tempSoldNumbers.filter(num => num !== i);
      } else {
        tempSoldNumbers.push(i);
      }
      renderManagerGrid();
    });

    managerNumberGrid.appendChild(btn);
  }
}

saveManagerBtn.addEventListener('click', () => {
  soldNumbers = [...tempSoldNumbers];
  localStorage.setItem('rede_solidaria_sold_numbers', JSON.stringify(soldNumbers));
  renderPublicGrid();
  showMessage('Alterações salvas com sucesso!', true);
});

whatsappForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!selectedNumber) {
    showMessage('Por favor, selecione um número disponível primeiro.');
    return;
  }

  const name = fullNameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!name || !phone) {
    showMessage('Por favor, preencha seu nome e telefone.');
    return;
  }

  // Mensagem ajustada sem caracteres especiais problemáticos
  const message = `Ola! Gostaria de reservar o número para a Rifa Solidaria:\n\nNumero Escolhido: ${fmt(selectedNumber)}\nNome: ${name}\nContato: ${phone}\n\nChave Pix para pagamento: ${PIX_KEY}\nValor: R$ 10,00\n\nAguardo a confirmacao da minha reserva!`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${ORGANIZER_WHATSAPP}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
  showMessage(`Redirecionando para o WhatsApp para confirmar o número ${fmt(selectedNumber)}!`, true);
});

document.getElementById('copyPixBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(PIX_KEY);
    showMessage('Chave Pix copiada com sucesso!', true);
  } catch {
    showMessage('Copie a chave Pix manualmente: ' + PIX_KEY);
  }
});

manageNumbersBtn.addEventListener('click', () => {
  const senhaInformada = prompt('Digite a senha de administrador para gerenciar os números:');
  
  if (senhaInformada === ADMIN_PASSWORD) {
    tempSoldNumbers = [...soldNumbers];
    publicView.style.display = 'none';
    managerView.style.display = 'block';
    renderManagerGrid();
  } else if (senhaInformada !== null) {
    alert('Senha incorreta!');
  }
});

closeManagerBtn.addEventListener('click', () => {
  managerView.style.display = 'none';
  publicView.style.display = 'block';
  renderPublicGrid();
});

renderPublicGrid();