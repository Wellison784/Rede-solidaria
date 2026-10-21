// ==========================================
// CONFIGURAÇÕES DA ORGANIZAÇÃO
// ==========================================
const ORGANIZER_WHATSAPP = "5547989037974"; 
const PIX_KEY = "proffnilvia.rg64@gmail.com";
const ADMIN_PASSWORD = "123"; 

// CONFIGURAÇÃO DO SEU FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD5fCIlXoTwrISHaVPbsaZACIvbR_rEkvY",
  authDomain: "rede-solidaria-35474.firebaseapp.com",
  databaseURL: "https://rede-solidaria-35474-default-rtdb.firebaseio.com",
  projectId: "rede-solidaria-35474",
  storageBucket: "rede-solidaria-35474.firebasestorage.app",
  messagingSenderId: "979924553048",
  appId: "1:979924553048:web:3a5e6ba8b829811473292d"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const soldNumbersRef = db.ref('soldNumbers');

// ==========================================
// LÓGICA DO SISTEMA
// ==========================================
let soldNumbers = [];
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

// ESCUTAR MUDANÇAS NO FIREBASE EM TEMPO REAL PARA TODOS OS USUÁRIOS
soldNumbersRef.on('value', (snapshot) => {
  const data = snapshot.val();
  soldNumbers = data ? data : [];
  renderPublicGrid();
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

// Salva as alterações diretamente na nuvem do Firebase
saveManagerBtn.addEventListener('click', () => {
  soldNumbersRef.set(tempSoldNumbers, (error) => {
    if (error) {
      showMessage('Erro ao salvar no Firebase!');
    } else {
      showMessage('Sincronizado na nuvem com sucesso!', true);
    }
  });
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