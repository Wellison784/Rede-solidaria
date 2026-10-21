// ==========================================
// CONFIGURAÇÕES DA ORGANIZAÇÃO
// ==========================================
// 1. WHATSAPP (55 + DDD + Número):
const ORGANIZER_WHATSAPP = "5547989037974"; 

// 2. CHAVE PIX:
const PIX_KEY = "proffnilvia.rg64@gmail.com";

// 3. SENHA DO PAINEL DA ORGANIZADORA:
const ADMIN_PASSWORD = "20012027"; 

// 4. NÚMEROS VENDIDOS INICIAIS (Deixe vazio [] se quiser controlar tudo pelo painel):
const INITIAL_SOLD_NUMBERS = []; 

// ==========================================
// LÓGICA DO SISTEMA
// ==========================================

// Pega do navegador ou inicializa com a lista fixa
let savedData = localStorage.getItem('rede_solidaria_sold_numbers');
let soldNumbers = savedData !== null ? JSON.parse(savedData) : [...INITIAL_SOLD_NUMBERS];

// Cópia temporária para edições no painel sem salvar imediatamente
let tempSoldNumbers = [];

let selectedNumber = null;

// Elementos do DOM
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

// Renderizar Grade Pública
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

// Renderizar Grade do Painel de Gerenciamento (Trabalha na lista temporária)
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

// Botão de Salvar Alterações
saveManagerBtn.addEventListener('click', () => {
  soldNumbers = [...tempSoldNumbers];
  localStorage.setItem('rede_solidaria_sold_numbers', JSON.stringify(soldNumbers));
  renderPublicGrid();
  showMessage('Alterações salvas com sucesso!', true);
});

// Enviar para WhatsApp
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

  const message = `Olá! Gostaria de reservar o número para a Rifa Solidária:

📌 *Número Escolhido:* ${fmt(selectedNumber)}
👤 *Nome:* ${name}
📞 *Contato:* ${phone}

💠 *Chave Pix para pagamento:* ${PIX_KEY}
💰 *Valor:* R$ 10,00

Aguardo a confirmação da minha reserva!`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${ORGANIZER_WHATSAPP}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
  showMessage(`Redirecionando para o WhatsApp para confirmar o número ${fmt(selectedNumber)}!`, true);
});

// Copiar Chave Pix
document.getElementById('copyPixBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(PIX_KEY);
    showMessage('Chave Pix copiada com sucesso!', true);
  } catch {
    showMessage('Copie a chave Pix manualmente: ' + PIX_KEY);
  }
});

// Abrir Painel
manageNumbersBtn.addEventListener('click', () => {
  const senhaInformada = prompt('Digite a senha de administrador para gerenciar os números:');
  
  if (senhaInformada === ADMIN_PASSWORD) {
    tempSoldNumbers = [...soldNumbers]; // Clona a lista atual para edição
    publicView.style.display = 'none';
    managerView.style.display = 'block';
    renderManagerGrid();
  } else if (senhaInformada !== null) {
    alert('Senha incorreta!');
  }
});

// Sair do Painel
closeManagerBtn.addEventListener('click', () => {
  managerView.style.display = 'none';
  publicView.style.display = 'block';
  renderPublicGrid();
});

// Inicializar
renderPublicGrid();