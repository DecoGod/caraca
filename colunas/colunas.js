const imageColumn = document.getElementById('image-column');
const nameColumn = document.getElementById('name-column');
const messageDisplay = document.getElementById('message');
const resetButton = document.getElementById('reset-button');
const continueButton = document.getElementById("continue-button");

// Defina seus pares imagem-nome aqui
// O 'id' deve ser único para cada par e será usado para fazer a associação
const associations = [
    { id: 'stl', imageUrl: './images/foto1.jpeg', name: 'São Tomé' },
    { id: 'cachorro', imageUrl: './images/foto5.jpeg', name: 'Viçosa' },
    { id: 'passaro', imageUrl: './images/foto6.jpeg', name: 'Vitória - ES' },
    { id: 'peixe', imageUrl: './images/foto8.jpeg', name: 'Carnaval OP' },
    { id: 'cavalo', imageUrl: './images/foto9.jpeg', name: 'Praia do Sacre Coeur' }
];

let selectedImagePoint = null;
let selectedNamePoint = null;
let correctMatches = 0;
let pointsLocked = false; // Impede cliques enquanto verifica associação

// Função para embaralhar um array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Função para criar um item de linha (imagem ou nome)
function createItemRow(type, data) {
    const row = document.createElement('div');
    row.classList.add('item-row');
    row.dataset.id = data.id; // ID do par para associação

    if (type === 'image') {
        const img = document.createElement('img');
        img.src = data.imageUrl;
        img.alt = data.name;
        row.appendChild(img);
    } else { // type === 'name'
        const span = document.createElement('span');
        span.textContent = data.name;
        row.appendChild(span);
    }

    const point = document.createElement('div');
    point.classList.add('point');
    point.dataset.id = data.id; // O ponto também guarda o ID
    point.dataset.type = type; // Indica se é um ponto de imagem ou nome
    point.addEventListener('click', handlePointClick);
    row.appendChild(point);

    return row;
}

// Função para inicializar o jogo
function startGame() {
    messageDisplay.textContent = '';
    imageColumn.innerHTML = '';
    nameColumn.innerHTML = '';
    selectedImagePoint = null;
    selectedNamePoint = null;
    correctMatches = 0;
    pointsLocked = false;

    // Embaralha as imagens e nomes separadamente
    const shuffledImages = [...associations];
    const shuffledNames = [...associations];
    shuffleArray(shuffledImages);
    shuffleArray(shuffledNames);

    // Cria e anexa as linhas às colunas
    shuffledImages.forEach(item => {
        imageColumn.appendChild(createItemRow('image', item));
    });

    shuffledNames.forEach(item => {
        nameColumn.appendChild(createItemRow('name', item));
    });
}

// Função para lidar com o clique em um ponto
function handlePointClick() {
    if (pointsLocked) return; // Se os pontos estão bloqueados, não faça nada
    if (this.classList.contains('correct')) return; // Não clique em pontos já corretos

    this.classList.add('selected');

    if (this.dataset.type === 'image') {
        if (selectedImagePoint && selectedImagePoint !== this) {
            // Se já havia um ponto de imagem selecionado e não é o mesmo, deseleciona-o
            selectedImagePoint.classList.remove('selected');
        }
        selectedImagePoint = this;
    } else { // type === 'name'
        if (selectedNamePoint && selectedNamePoint !== this) {
            // Se já havia um ponto de nome selecionado e não é o mesmo, deseleciona-o
            selectedNamePoint.classList.remove('selected');
        }
        selectedNamePoint = this;
    }

    // Se ambos os tipos de pontos estão selecionados, verifique a associação
    if (selectedImagePoint && selectedNamePoint) {
        pointsLocked = true; // Bloqueia outros cliques
        checkForMatch();
    }
}

// Função para verificar se a associação é correta
function checkForMatch() {
    const imageId = selectedImagePoint.dataset.id;
    const nameId = selectedNamePoint.dataset.id;

    if (imageId === nameId) {
        // Associação correta
        messageDisplay.textContent = 'Correto!';
        messageDisplay.style.color = '#27ae60'; // Verde

        selectedImagePoint.classList.remove('selected');
        selectedNamePoint.classList.remove('selected');

        selectedImagePoint.classList.add('correct');
        selectedNamePoint.classList.add('correct');

        // Remove event listeners para pontos corretos para que não possam ser clicados novamente
        selectedImagePoint.removeEventListener('click', handlePointClick);
        selectedNamePoint.removeEventListener('click', handlePointClick);

        correctMatches++;
        if (correctMatches === associations.length) {
            setTimeout(() => {
                messageDisplay.textContent = 'Parabéns! Você associou tudo corretamente!';
                messageDisplay.style.color = '#27ae60';
                continueButton.disabled = false;
            }, 500);
        }
        resetSelections();

    } else {
        // Associação incorreta
        messageDisplay.textContent = 'Ops! Tente novamente.';
        messageDisplay.style.color = '#e74c3c'; // Vermelho

        selectedImagePoint.classList.add('incorrect');
        selectedNamePoint.classList.add('incorrect');

        setTimeout(() => {
            selectedImagePoint.classList.remove('selected', 'incorrect');
            selectedNamePoint.classList.remove('selected', 'incorrect');
            resetSelections();
        }, 800); // Tempo para o jogador ver o erro
    }
}

// Função para resetar as seleções e liberar os cliques
function resetSelections() {
    selectedImagePoint = null;
    selectedNamePoint = null;
    pointsLocked = false;
}

// Event listener para o botão de reiniciar
resetButton.addEventListener('click', startGame);

continueButton.addEventListener('click', () => {
    window.location.href = "./charada.html"
});

// Inicia o jogo quando a página carrega
startGame();