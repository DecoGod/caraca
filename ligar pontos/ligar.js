const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageDisplay = document.getElementById('message');
const resetButton = document.getElementById('resetButton');

const CANVAS_WIDTH = 761;
const CANVAS_HEIGHT = 1024;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let dots = []; // Agora, este array será preenchido com seus pontos definidos
let connectedDots = [];
let currentDotIndex = 1; // Próximo ponto esperado para conexão
let isDrawing = false;
let lastPoint = null;

const backgroundImage = new Image();
// Defina o caminho para a sua imagem
backgroundImage.src = 'gato.jpg'; // Altere para o nome e caminho do seu arquivo de imagem

// Opcional: Garanta que a imagem esteja carregada antes de tentar desenhar
// Isso evita que ela não apareça se o JS tentar desenhar antes do carregamento.
backgroundImage.onload = () => {
    // Se quiser reiniciar o jogo ou desenhar assim que a imagem carregar
    // (útil se a imagem for grande e demorar a carregar)
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

// --- FIM DA MODIFICAÇÃO ---


// Função para desenhar um ponto
function drawDot(dot) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = connectedDots.includes(dot) ? '#000000' : '#000000'; // Cor muda se conectado
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

// Função para desenhar todas as linhas conectadas
function drawLines() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Limpa o canvas

    if (backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
        ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Desenha as linhas já conectadas
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

    // Desenha todos os pontos
    dots.forEach(drawDot);
}

// Função para verificar se um clique está perto de um ponto
function getDotAtPoint(x, y) {
    for (const dot of dots) {
        const distance = Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2));
        if (distance < 20) { // Raio de 20px para detectar o clique
            return dot;
        }
    }
    return null;
}

// Evento de início do desenho
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedDot = getDotAtPoint(x, y);

    if (clickedDot && clickedDot.number === currentDotIndex) {
        isDrawing = true;
        lastPoint = { x: clickedDot.x, y: clickedDot.y };
        connectedDots.push(clickedDot);
        messageDisplay.textContent = '';
        drawLines(); // Redesenha para mostrar o ponto inicial conectado
    } else if (clickedDot) {
        messageDisplay.textContent = `Atenção: Conecte o ponto ${currentDotIndex} primeiro!`;
    }
});

// Evento de movimento do mouse (para desenhar a linha)
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawLines(); // Limpa e redesenha as linhas e pontos existentes
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0056b3';
    ctx.lineWidth = 3;
    ctx.stroke();
});

// Evento de fim do desenho
canvas.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const droppedOnDot = getDotAtPoint(x, y);

    if (droppedOnDot && droppedOnDot.number === currentDotIndex + 1) {
        connectedDots.push(droppedOnDot);
        currentDotIndex++;
        messageDisplay.textContent = '';
        drawLines();
    } else {
        messageDisplay.textContent = `Ponto incorreto! Tente conectar o ponto ${currentDotIndex + 1}.`;
        drawLines();
        // Se a conexão foi incorreta, precisamos remover o último ponto adicionado
        // para que o jogador tente novamente do ponto anterior correto.
        // No entanto, se o jogador clicou no ponto errado após ter soltado o mouse,
        // o `connectedDots` só terá o último ponto correto.
        // A lógica abaixo garante que só removemos se o último ponto adicionado foi o ponto inicial
        // de uma tentativa falha, ou se a linha em si foi feita para um ponto errado.
        // Para simplificar e evitar que o jogador "perca" um ponto já conectado corretamente:
        // Apenas limpa a linha de arrasto e não adiciona o ponto errado.
        // Se `connectedDots` já contém o `currentDotIndex` certo, não precisamos remover.
        // A remoção seria mais complexa para gerenciar desfazeres.
        // O importante é que `currentDotIndex` não avança e a mensagem informa o erro.
        // Se você quiser que a linha desenhada desapareça completamente, `drawLines()` já faz isso.
    }
    if (droppedOnDot && dots.length === currentDotIndex){
        messageDisplay.textContent = 'Parabéns! Você conectou todos os pontos!';
    }
});

// Evento para reiniciar o jogo
resetButton.addEventListener('click', startGame);

function startGame() {
    messageDisplay.textContent = '';
    connectedDots = [];
    currentDotIndex = 1;
    // --- MUDANÇA AQUI: Chamamos a nova função defineCustomDots() ---
    defineCustomDots();
    drawLines();
}

// Inicia o jogo quando a página carrega
startGame();