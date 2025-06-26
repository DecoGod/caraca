const gameContainer = document.querySelector('.game-container');
const attemptsCountSpan = document.getElementById('attempts-count');
const resetButton = document.getElementById('reset-button');
const continueButton = document.getElementById("continue-button");

// Nomes dos arquivos das suas 10 imagens (sem o caminho, apenas o nome do arquivo)
const imageNames = [
    'foto1.jpeg',
    'foto2.jpeg',
    'foto3.jpeg',
    'foto4.jpeg',
    'foto5.jpeg',
    'foto6.jpeg',
    'foto7.jpeg',
    'foto8.jpeg',
    'foto9.jpeg',
    'foto10.jpeg'
];

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false; // Impede que mais cartas sejam viradas enquanto 2 estão visíveis
let matchesFound = 0;
let attempts = 0;

// Função para embaralhar um array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Função para criar as cartas do jogo
function createCards() {
    // Limpa o tabuleiro antes de criar novas cartas
    gameContainer.innerHTML = '';
    cards = [];
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchesFound = 0;
    attempts = 0;
    attemptsCountSpan.textContent = attempts;

    // Duplica os nomes das imagens para criar pares
    const cardImages = [...imageNames, ...imageNames];
    shuffleArray(cardImages); // Embaralha as imagens

    cardImages.forEach((imageName, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.name = imageName; // Armazena o nome da imagem como um atributo de dados

        card.innerHTML = `
            <div class="card-inner">
                <div class="face card-front">
                    <img src="./images/${imageName}" alt="Memória ${index}">
                </div>
                <div class="face card-back"></div>
            </div>
        `;
        card.addEventListener('click', flipCard);
        gameContainer.appendChild(card);
        cards.push(card);
    });
}

// Função para virar uma carta
function flipCard() {
    if (lockBoard) return; // Não vira se o tabuleiro estiver bloqueado
    if (this === firstCard) return; // Não vira a mesma carta duas vezes

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    attempts++;
    attemptsCountSpan.textContent = attempts;
    checkForMatch();
}

// Função para verificar se as duas cartas viradas formam um par
function checkForMatch() {
    const isMatch = firstCard.dataset.name === secondCard.dataset.name;

    isMatch ? disableCards() : unflipCards();
}

// Função para desabilitar cartas que formam um par
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    matchesFound++;
    if (matchesFound === imageNames.length) { // imageNames.length é o número total de pares
        setTimeout(() => alert(`Parabéns! Você encontrou todos os pares!`), 500);
        continueButton.disabled = false;
    }

    resetBoard();
}

// Função para desvirar cartas que não formam um par
function unflipCards() {
    lockBoard = true; // Bloqueia o tabuleiro para que o jogador não vire mais cartas

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000); // Tempo para o jogador ver as cartas antes de desvirarem
}

// Função para resetar as variáveis de controle do tabuleiro
function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

// Event listener para o botão de reiniciar
resetButton.addEventListener('click', createCards);

continueButton.addEventListener('click', () => {
    window.location.href = "./charada.html"
});

// Inicia o jogo quando a página carrega
createCards();