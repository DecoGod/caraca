const puzzleContainer = document.querySelector('.puzzle-container');
const resetButton = document.getElementById('reset-button');
const messageDisplay = document.getElementById('message');

// --- Configurações do Quebra-Cabeça ---
const IMAGE_URL = './quebracabeca.jpeg'; // **Mude para o caminho da sua imagem**
const ROWS = 3; // Número de linhas de peças
const COLS = 3; // Número de colunas de peças
const PUZZLE_SIZE = Math.min(screen.width, 450); // Tamanho total do quebra-cabeça em pixels (ex: 450x450px)

// --- Variáveis Globais ---
let pieces = [];
let slots = []; // Slots agora são os contêineres das peças
let pieceSize = PUZZLE_SIZE / ROWS;

// Variáveis para o Drag and Drop (agora também para toque)
let draggedPiece = null;
let currentDropTarget = null; // Para gerenciar o slot de destino durante o arrasto por toque

// --- Funções Auxiliares ---

// Função para embaralhar um array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Função para obter coordenadas do evento (mouse ou toque)
function getCoords(e) {
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) { // para touchend
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const rect = puzzleContainer.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
}

// Função para encontrar o slot (ou peça) sob as coordenadas
function getElementUnderPoint(x, y) {
    // Esconde a peça arrastada temporariamente para encontrar o elemento abaixo dela
    if (draggedPiece) draggedPiece.style.display = 'none';

    const targetElement = document.elementFromPoint(x, y);

    if (draggedPiece) draggedPiece.style.display = ''; // Volta a exibir a peça

    // Retorna o slot mais próximo se o targetElement não for o slot diretamente
    // ou se for a própria peça arrastada (evita auto-drop)
    if (targetElement && targetElement.classList.contains('puzzle-slot')) {
        return targetElement;
    } else if (targetElement && targetElement.classList.contains('puzzle-piece')) {
        return targetElement.parentNode; // Retorna o slot pai da peça
    }
    return null;
}


// --- Funções Principais do Jogo ---

function createPuzzle() {
    messageDisplay.textContent = '';
    puzzleContainer.innerHTML = '';
    pieces = [];
    slots = [];
    draggedPiece = null;
    currentDropTarget = null;

    puzzleContainer.style.setProperty('--piece-size', `${pieceSize}px`);
    puzzleContainer.style.gridTemplateColumns = `repeat(${COLS}, ${pieceSize}px)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${ROWS}, ${pieceSize}px)`;
    puzzleContainer.style.width = `${PUZZLE_SIZE}px`;
    puzzleContainer.style.height = `${PUZZLE_SIZE}px`;

    const img = new Image();
    img.src = IMAGE_URL;
    img.onload = () => {
        const initialPieceData = [];
        for (let i = 0; i < ROWS * COLS; i++) {
            const row = Math.floor(i / COLS);
            const col = i % COLS;

            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.draggable = true; // Mantém para mouse
            
            const bgX = -col * pieceSize;
            const bgY = -row * pieceSize;
            piece.style.backgroundImage = `url(${IMAGE_URL})`;
            piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
            piece.style.backgroundSize = `${PUZZLE_SIZE}px ${PUZZLE_SIZE}px`;

            piece.dataset.correctPos = i; // Posição correta no quebra-cabeça
            initialPieceData.push(piece);
        }

        shuffleArray(initialPieceData); // Embaralha as peças

        // Cria os slots e os preenche com as peças embaralhadas
        for (let i = 0; i < ROWS * COLS; i++) {
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot');
            slot.dataset.slotPos = i; // Posição física deste slot na grade

            const piece = initialPieceData[i];
            piece.dataset.currentSlotPos = i; // A peça sabe em qual slot ela está atualmente
            slot.appendChild(piece);

            // Adiciona event listeners de mouse e toque para as PEÇAS
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);
            piece.addEventListener('touchstart', handleTouchStart, { passive: false });
            piece.addEventListener('touchmove', handleTouchMove, { passive: false });
            piece.addEventListener('touchend', handleTouchEnd, { passive: false });

            // Adiciona event listeners de mouse para os SLOTS (para drop)
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);
            slot.addEventListener('dragleave', handleDragLeave);
            slot.addEventListener('dragenter', handleDragEnter);
            
            // Adiciona os slots ao contêiner
            puzzleContainer.appendChild(slot);
            slots.push(slot); // Guarda referência aos slots
        }
        
        checkWin(); // Verifica se o jogo já está ganho (raro no início)
    };
}


// --- Drag and Drop Handlers (Mouse) ---

function handleDragStart(e) {
    draggedPiece = this;
    draggedPiece.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Necessário para Firefox
}

function handleDragEnd(e) {
    if (draggedPiece) {
        draggedPiece.classList.remove('dragging');
        draggedPiece = null;
    }
    document.querySelectorAll('.puzzle-slot').forEach(slot => {
        slot.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (this.classList.contains('puzzle-slot')) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (this.classList.contains('puzzle-slot')) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const targetSlot = this; // O slot onde a peça foi solta
    
    targetSlot.classList.remove('drag-over');
    
    if (draggedPiece && draggedPiece.parentNode !== targetSlot) {
        const sourceSlot = draggedPiece.parentNode;
        const targetPiece = targetSlot.querySelector('.puzzle-piece');
        
        // Realiza a troca visual no DOM
        if (targetPiece) { // Se o slot de destino tinha uma peça
            sourceSlot.appendChild(targetPiece);
            targetPiece.dataset.currentSlotPos = sourceSlot.dataset.slotPos;
        } else { // Se o slot de destino estava vazio (o que não deve acontecer no nosso setup, mas é bom ter)
            sourceSlot.innerHTML = ''; // Limpa o slot de origem
        }
        
        targetSlot.appendChild(draggedPiece);
        draggedPiece.dataset.currentSlotPos = targetSlot.dataset.slotPos;
        
        checkWin();
    }

    draggedPiece.classList.remove('dragging');
    draggedPiece = null; // Limpa a peça arrastada após o drop
}


// --- Touch Handlers ---

function handleTouchStart(e) {
    e.preventDefault(); // Previne rolagem/zoom padrão
    draggedPiece = this; // 'this' é a peça tocada
    draggedPiece.classList.add('dragging');

    // Mover a peça para o topo do Z-index para que ela apareça sobre as outras
    draggedPiece.style.position = 'absolute'; // ou 'fixed' se quiser que ela siga o dedo na tela inteira
    draggedPiece.style.zIndex = '1000';

    // Posiciona a peça diretamente sob o dedo
    const coords = getCoords(e);
    // Ajuste para centralizar a peça no dedo (opcional, mas melhora a UX)
    draggedPiece.style.left = `${coords.x - pieceSize / 2}px`;
    draggedPiece.style.top = `${coords.y - pieceSize / 2}px`;

    // Adiciona a peça diretamente ao body ou ao puzzleContainer para que possa ser movida livremente
    // Vamos adicionar ao body para que o movimento seja "global" e não restrito ao puzzleContainer
    document.body.appendChild(draggedPiece);
}

function handleTouchMove(e) {
    e.preventDefault(); // Previne rolagem/zoom padrão
    if (!draggedPiece) return;
    
    const coords = getCoords(e);
    draggedPiece.style.left = `${coords.x - pieceSize / 2}px`;
    draggedPiece.style.top = `${coords.y - pieceSize / 2}px`;

    // Lógica para highlight do alvo de drop
    const targetElement = getElementUnderPoint(e.touches[0].clientX, e.touches[0].clientY);

    // Remove highlight do alvo anterior se houver
    if (currentDropTarget && currentDropTarget !== targetElement) {
        currentDropTarget.classList.remove('drag-over');
    }

    // Adiciona highlight ao novo alvo
    if (targetElement && targetElement !== draggedPiece.parentNode) { // Não realçar o próprio slot de origem
        targetElement.classList.add('drag-over');
        currentDropTarget = targetElement;
    } else {
        currentDropTarget = null;
    }
}

function handleTouchEnd(e) {
    e.preventDefault(); // Previne rolagem/zoom padrão
    if (!draggedPiece) return;

    // Remove a peça do fluxo normal e volta ela para o puzzleContainer
    draggedPiece.style.position = '';
    draggedPiece.style.zIndex = '';
    draggedPiece.classList.remove('dragging');

    const coords = getCoords(e);
    const targetSlot = getElementUnderPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

    // Se houver um slot válido para soltar (e não é o slot original da peça arrastada)
    if (targetSlot && draggedPiece.dataset.currentSlotPos !== targetSlot.dataset.slotPos) {
        const sourceSlot = document.querySelector(`.puzzle-slot[data-slot-pos="${draggedPiece.dataset.currentSlotPos}"]`);
        const targetPiece = targetSlot.querySelector('.puzzle-piece');

        // Lógica de troca de peças
        if (targetPiece) { // Se o slot de destino tinha uma peça
            sourceSlot.appendChild(targetPiece);
            targetPiece.dataset.currentSlotPos = sourceSlot.dataset.slotPos;
        } else { // Se o slot de destino estava vazio (neste jogo, sempre terá uma peça, então este else é redundante)
            sourceSlot.innerHTML = '';
        }
        
        targetSlot.appendChild(draggedPiece);
        draggedPiece.dataset.currentSlotPos = targetSlot.dataset.slotPos;
    } else {
        // Se soltou em um lugar inválido ou no mesmo slot, volta a peça para seu slot original
        const sourceSlot = document.querySelector(`.puzzle-slot[data-slot-pos="${draggedPiece.dataset.currentSlotPos}"]`);
        sourceSlot.appendChild(draggedPiece); // Volta a peça para onde ela estava
    }

    // Limpa highlights e variáveis de arrasto
    document.querySelectorAll('.puzzle-slot').forEach(slot => slot.classList.remove('drag-over'));
    draggedPiece = null;
    currentDropTarget = null;

    checkWin();
}


// --- Verificação de Vitória ---

function checkWin() {
    let correctCount = 0;
    const allSlots = document.querySelectorAll('.puzzle-slot');

    allSlots.forEach(slot => {
        const pieceInSlot = slot.querySelector('.puzzle-piece');
        if (pieceInSlot) {
            const currentSlotPos = parseInt(slot.dataset.slotPos);
            const correctPiecePos = parseInt(pieceInSlot.dataset.correctPos);

            if (currentSlotPos === correctPiecePos) {
                correctCount++;
            }
        }
    });

    if (correctCount === ROWS * COLS) {
        messageDisplay.textContent = 'Quebra-cabeça Montado! Parabéns!';
        messageDisplay.style.color = '#27ae60';
        puzzleContainer.classList.add('solved');
        // Desabilitar o arrastar e soltar após a vitória
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.draggable = false;
            piece.removeEventListener('touchstart', handleTouchStart);
            piece.removeEventListener('touchmove', handleTouchMove);
            piece.removeEventListener('touchend', handleTouchEnd);
        });
    } else {
        messageDisplay.textContent = '';
        puzzleContainer.classList.remove('solved');
        // Certifique-se de que as peças são arrastáveis se o jogo não estiver resolvido
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.draggable = true;
        });
    }
}

// --- Event Listeners e Inicialização ---

resetButton.addEventListener('click', createPuzzle);

// Inicia o jogo quando a página carrega
createPuzzle();