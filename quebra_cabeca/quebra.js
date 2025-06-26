const puzzleContainer = document.querySelector('.puzzle-container');
const resetButton = document.getElementById('reset-button');
const messageDisplay = document.getElementById('message');

// --- Configurações do Quebra-Cabeça ---
const IMAGE_URL = './quebracabeca.jpeg'; // **Mude para o caminho da sua imagem**
const ROWS = 3; // Número de linhas de peças
const COLS = 3; // Número de colunas de peças
const PUZZLE_SIZE = 450; // Tamanho total do quebra-cabeça em pixels (ex: 450x450px)

// --- Variáveis Globais ---
let pieces = [];
let slots = [];
let pieceSize = PUZZLE_SIZE / ROWS; // Tamanho de cada peça (assumindo ROWS = COLS para peças quadradas)

// Variáveis para o Drag and Drop
let draggedPiece = null;

// --- Funções Auxiliares ---

// Função para embaralhar um array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- Funções Principais do Jogo ---

function createPuzzle() {
    messageDisplay.textContent = '';
    puzzleContainer.innerHTML = '';
    pieces = [];
    slots = [];
    draggedPiece = null;

    // Define o tamanho das peças no CSS via variável
    puzzleContainer.style.setProperty('--piece-size', `${pieceSize}px`);
    puzzleContainer.style.gridTemplateColumns = `repeat(${COLS}, ${pieceSize}px)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${ROWS}, ${pieceSize}px)`;
    puzzleContainer.style.width = `${PUZZLE_SIZE}px`; // Define o tamanho total do contêiner
    puzzleContainer.style.height = `${PUZZLE_SIZE}px`;

    const img = new Image();
    img.src = IMAGE_URL;
    img.onload = () => {
        // Crie as peças e os slots
        for (let i = 0; i < ROWS * COLS; i++) {
            const row = Math.floor(i / COLS);
            const col = i % COLS;

            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.draggable = true; // Torna a peça arrastável

            // Calcular a posição de fundo para "cortar" a parte da imagem
            const bgX = -col * pieceSize;
            const bgY = -row * pieceSize;
            piece.style.backgroundImage = `url(${IMAGE_URL})`;
            piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
            piece.style.backgroundSize = `${PUZZLE_SIZE}px ${PUZZLE_SIZE}px`; // Tamanho da imagem original no fundo

            piece.dataset.correctPos = i; // Armazena a posição correta da peça

            // Adiciona event listeners para arrastar
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);

            pieces.push(piece);

            // Crie os slots vazios
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot');
            slot.dataset.slotPos = i; // Armazena a posição do slot
            // Adiciona event listeners para soltar
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);
            slot.addEventListener('dragleave', handleDragLeave); // Para remover highlight
            slot.addEventListener('dragenter', handleDragEnter); // Para adicionar highlight

            slots.push(slot);
        }

        // Embaralha as peças e as adiciona ao contêiner
        shuffleArray(pieces);
        pieces.forEach(piece => puzzleContainer.appendChild(piece));

        // Inicialmente, adicione os slots para o estado inicial, ou apenas as peças embaralhadas
        // O drag and drop vai gerenciar a troca entre peças e slots.
        // Para este setup, a lógica inicial adiciona as peças embaralhadas.
        // O 'drop' event listener será no slot, então precisamos que os slots estejam lá.
        // Ou, uma abordagem comum é ter slots pré-definidos e arrastar as peças para eles.

        // Vamos modificar para ter slots fixos e peças arrastáveis para eles.
        // Remove as peças adicionadas e adiciona os slots no lugar.
        puzzleContainer.innerHTML = ''; // Limpa de novo para adicionar os slots primeiro
        shuffleArray(slots); // Embaralha os slots para que as peças embaralhadas caiam neles.
                             // Na verdade, queremos slots em ordem, e as peças embaralhadas em slots em ordem.
                             // OU: manter os slots em ordem, e embaralhar as peças que serão colocadas nesses slots.
                             // A forma mais fácil é embaralhar as peças e colocá-las em slots em ordem.

        // Reiniciando a lógica para usar slots fixos e peças flutuantes/arrastáveis
        // Um modelo comum é ter um 'tabuleiro' de slots e um 'pool' de peças embaralhadas.
        // Mas para drag-and-drop dentro do próprio tabuleiro:
        // As peças precisam ser arrastadas para *outras peças* ou para *slots vazios*.
        // A lógica do 'dragover' e 'drop' precisa ser no elemento que vai *receber* o drop.

        // Implementação Simplificada: Embaralha as peças e as coloca em slots.
        // Quando uma peça é arrastada, seu slot original fica vazio.
        // Quando solta, ela troca de lugar com o que estava no slot de destino.

        // Para simplificar, vamos criar os slots vazios e depois preenchê-los com as peças embaralhadas.
        const combined = [...pieces]; // Copia as peças criadas

        // Gera a ordem correta dos slots para o quebra-cabeça
        // E preenche com as peças embaralhadas.
        const initialPuzzleLayout = [];
        for (let i = 0; i < ROWS * COLS; i++) {
            initialPuzzleLayout.push({ type: 'piece', content: pieces[i], originalIndex: i });
        }
        // Embaralha a ordem inicial das peças no layout
        shuffleArray(initialPuzzleLayout);

        // Renderiza o layout inicial
        initialPuzzleLayout.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot'); // Todos são slots por onde peças podem passar
            slot.dataset.currentPieceIndex = index; // Qual peça está *atualmente* neste slot
            slot.dataset.slotPos = index; // Posição física deste slot na grade

            // Adiciona a peça embaralhada dentro do slot
            const piece = item.content; // 'content' é a div da peça
            piece.dataset.currentSlotPos = index; // A peça também sabe onde ela está

            slot.appendChild(piece);

            // Adiciona event listeners para arrastar E para soltar nas peças
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);
            
            // Eventos para o slot, para permitir drop
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);
            slot.addEventListener('dragleave', handleDragLeave);
            slot.addEventListener('dragenter', handleDragEnter);

            puzzleContainer.appendChild(slot);
        });

        checkWin(); // Verifica se o jogo já está ganho (improvável no início, mas bom para debug)
    };
}


// --- Drag and Drop Handlers ---

function handleDragStart(e) {
    draggedPiece = this; // 'this' é a div da peça
    draggedPiece.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    // É comum usar e.dataTransfer.setData para passar dados, mas aqui usaremos a variável global
}

function handleDragEnd(e) {
    draggedPiece.classList.remove('dragging');
    draggedPiece = null;
    // Remover classes de highlight de todos os slots após o dragend
    document.querySelectorAll('.puzzle-slot').forEach(slot => {
        slot.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault(); // Necessário para permitir o drop
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

    targetSlot.classList.remove('drag-over'); // Remove highlight

    if (draggedPiece) {
        // O slot de origem da peça arrastada
        const sourceSlot = draggedPiece.parentNode;

        // Troca as peças de lugar no DOM
        if (sourceSlot !== targetSlot) {
            const targetPiece = targetSlot.querySelector('.puzzle-piece');

            // Remove a peça arrastada do slot de origem
            sourceSlot.removeChild(draggedPiece);

            // Se o slot de destino tinha uma peça, move-a para o slot de origem
            if (targetPiece) {
                targetSlot.removeChild(targetPiece); // Remove do destino
                sourceSlot.appendChild(targetPiece); // Adiciona ao origem
                targetPiece.dataset.currentSlotPos = sourceSlot.dataset.slotPos; // Atualiza a posição da peça movida
            }
            
            // Coloca a peça arrastada no slot de destino
            targetSlot.appendChild(draggedPiece);
            draggedPiece.dataset.currentSlotPos = targetSlot.dataset.slotPos; // Atualiza a posição da peça arrastada

            checkWin(); // Verifica se o quebra-cabeça foi montado
        }
    }
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
        puzzleContainer.classList.add('solved'); // Adiciona uma classe para estilos de vitória (opcional)
        // Desabilitar o arrastar e soltar após a vitória
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.draggable = false;
        });
    } else {
        messageDisplay.textContent = ''; // Limpa a mensagem se não estiver completo
        puzzleContainer.classList.remove('solved');
    }
}

// --- Event Listeners e Inicialização ---

resetButton.addEventListener('click', createPuzzle);

// Inicia o jogo quando a página carrega
createPuzzle();