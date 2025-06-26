const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageDisplay = document.getElementById('message');
const resetButton = document.getElementById('resetButton');

const CANVAS_WIDTH = 761;
const CANVAS_HEIGHT = 1024;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let dots = [];
let connectedDots = [];
let currentDotIndex = 1; // Próximo ponto esperado para conexão
let isDrawing = false;
let lastPoint = null;

// Objeto Image para o fundo (mantenha como está)
const backgroundImage = new Image();
backgroundImage.src = 'gato.jpg'; // Altere para o nome e caminho do seu arquivo de imagem
backgroundImage.onload = () => {
    drawLines();
};

// Nova função para DEFINIR os pontos
function defineCustomDots() {
    // Exemplo de pontos para formar um triângulo:
       dots = [
        // Orelha esquerda - externa
        { x: 600, y: 706, number: 1 },
        { x: 482, y: 812, number: 2 },
        { x: 276, y: 842, number: 3 },
        { x: 92, y: 852, number: 4 },
        { x: 62, y: 904, number: 5 },
        { x: 106, y: 950, number: 6 },
        { x: 312, y: 954, number: 7 },
        { x: 511, y: 912, number: 8 },
        { x: 635, y: 815, number: 9 },
        { x: 677, y: 682, number: 10 },
        { x: 654, y: 536, number: 11 },
        { x: 590, y: 405, number: 12 },
        { x: 456, y: 326, number: 13 },
        { x: 446, y: 279, number: 14 },
        { x: 501, y: 141, number: 15 },
        { x: 446, y: 106, number: 16 },
        { x: 370, y: 181, number: 17 },
        { x: 269, y: 178, number: 18 },
        { x: 179, y: 108, number: 19 },
        { x: 126, y: 144, number: 20 },
        { x: 157, y: 271, number: 21 },
        { x: 140, y: 368, number: 22 },
        { x: 165, y: 389, number: 23 },
        { x: 159, y: 551, number: 24 },
        { x: 239, y: 611, number: 25 },
        { x: 243, y: 754, number: 26 },
        { x: 189, y: 768, number: 27 },
        { x: 188, y: 833, number: 28 },

    ];

    // É importante garantir que os pontos estejam ordenados pelo número
    // Se você os definir em ordem, esta linha não é estritamente necessária,
    // mas é uma boa prática para segurança.
    dots.sort((a, b) => a.number - b.number);
}

// Função para desenhar um ponto (mantenha como está)
function drawDot(dot) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 10, 0, Math.PI * 2); // Raio do ponto (ajuste se precisar)
    ctx.fillStyle = connectedDots.includes(dot) ? '#000000' : '#000000';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dot.number, dot.x, dot.y);
}

// Função para desenhar todas as linhas conectadas (mantenha como está)
function drawLines() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
        ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    if (connectedDots.length > 1) {
        ctx.strokeStyle = '#000000'; // Cor da linha
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(connectedDots[0].x, connectedDots[0].y);
        for (let i = 1; i < connectedDots.length; i++) {
            ctx.lineTo(connectedDots[i].x, connectedDots[i].y);
        }
        ctx.stroke();
    }
    dots.forEach(drawDot);
}

// Função para verificar se um clique/toque está perto de um ponto (mantenha como está)
function getDotAtPoint(x, y) {
    for (const dot of dots) {
        const distance = Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2));
        if (distance < 20) {
            return dot;
        }
    }
    return null;
}

// --- FUNÇÕES AUXILIARES PARA NORMALIZAR COORDENADAS ---
function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    // Verifica se é um evento de toque ou mouse
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
}


// --- EVENTOS DO MOUSE (Mantenha como estão, mas serão "espelhados" pelos toques) ---
canvas.addEventListener('mousedown', (e) => {
    const { x, y } = getCoords(e);
    const clickedDot = getDotAtPoint(x, y);

    if (clickedDot && clickedDot.number === currentDotIndex) {
        isDrawing = true;
        lastPoint = { x: clickedDot.x, y: clickedDot.y };
        connectedDots.push(clickedDot);
        messageDisplay.textContent = '';
        drawLines();
    } else if (clickedDot) {
        messageDisplay.textContent = `Atenção: Conecte o ponto ${currentDotIndex} primeiro!`;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    drawLines();
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();
});

canvas.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;

    const { x, y } = getCoords(e);
    const droppedOnDot = getDotAtPoint(x, y);

    if (droppedOnDot && droppedOnDot.number === currentDotIndex + 1) {
        connectedDots.push(droppedOnDot);
        currentDotIndex++;
        messageDisplay.textContent = '';
        drawLines();

        if (currentDotIndex > dots.length) {
            messageDisplay.textContent = 'Parabéns! Você conectou todos os pontos!';
        }
    } else {
        messageDisplay.textContent = `Ponto incorreto! Tente conectar o ponto ${currentDotIndex + 1}.`;
        // Se `connectedDots` tem pelo menos o ponto inicial (currentDotIndex) e o último adicionado é incorreto,
        // remova o último para que o jogador possa tentar novamente do ponto correto.
        if (connectedDots.length > 0 && connectedDots[connectedDots.length - 1].number !== (currentDotIndex - 1)) {
            connectedDots.pop();
        }
        drawLines();
    }
});


// --- NOVOS EVENTOS DE TOQUE PARA DISPOSITIVOS MÓVEIS ---
canvas.addEventListener('touchstart', (e) => {
    // Previne o comportamento padrão do navegador (ex: scroll, zoom) ao tocar
    e.preventDefault();
    // Simula um mousedown usando os dados do toque
    canvas.dispatchEvent(new MouseEvent('mousedown', {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        bubbles: true,
        cancelable: true
    }));
}, { passive: false }); // { passive: false } permite que preventDefault() funcione

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    // Simula um mousemove usando os dados do toque
    canvas.dispatchEvent(new MouseEvent('mousemove', {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        bubbles: true,
        cancelable: true
    }));
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    // Simula um mouseup usando os dados do toque
    // Importante: toques[0] não existe no touchend, usamos changedTouches[0]
    canvas.dispatchEvent(new MouseEvent('mouseup', {
        clientX: e.changedTouches[0].clientX,
        clientY: e.changedTouches[0].clientY,
        bubbles: true,
        cancelable: true
    }));
}, { passive: false });


// Evento para reiniciar o jogo (mantenha como está)
resetButton.addEventListener('click', startGame);

function startGame() {
    messageDisplay.textContent = '';
    connectedDots = [];
    currentDotIndex = 1;
    defineCustomDots(); // Chama a função para definir seus pontos
    drawLines();
}

// Inicia o jogo quando a página carrega
startGame();