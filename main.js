const TicTacToe = (function() {
    // player factory
    const Player = (char, token) => {
        const getChar = () => char;
        const getToken = () => token;
        return {getChar, getToken};
    };

    // create characters
    const alien = Player('Xenomorph', '<img src="./assets/alien.svg" class="token alien-token">');
    const predator = Player('Predator', '<img src="./assets/predator.svg">');

    const AI = (function() {
        // check if a move would win
        const wouldWin = (token, row, col) => {
            // Only check if the cell is empty
            if (Gameboard.getCellValue(row, col) !== '') {
                return false;
            }
        
            // Make the move
            Gameboard.dropToken(row, col, token);
            
            // Check if it's a winning move
            const winning = Gameboard.checkWin(token);
            
            // IMPORTANT: Undo the move by setting it back to empty
            Gameboard.dropToken(row, col, '');
            
            return winning;
        };
        
        
    
        // find winning move for given token
        const findWinningMove = (token) => {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (Gameboard.getCellValue(i, j) === '') {
                        if (wouldWin(token, i, j)) {
                            return [i, j];
                        }
                    }
                }
            }
            return null;
        };
    
        // get corner moves
        const getCornerMoves = () => {
            const corners = [[0,0], [0,2], [2,0], [2,2]];
            return corners.filter(([row, col]) => 
                Gameboard.getCellValue(row, col) === ''
            );
        };
    
        // check if center is available
        const isCenterAvailable = () => 
            Gameboard.getCellValue(1, 1) === '';
    
        const getRandomMove = () => {
            const availableMoves = [];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (Gameboard.getCellValue(i, j) === '') {
                        availableMoves.push([i, j]);
                    }
                }
            }
            
            if (availableMoves.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableMoves.length);
                return availableMoves[randomIndex];
            }
            return null;
        };
    
        const getBestMove = () => {
            // add randomness to make the AI less perfect
            const aggressiveness = Math.random();  // 0 to 1
        
            // sometimes take an aggressive random move
            if (aggressiveness > 0.8) {
                const message = "goes for an aggressive random attack!";
                const move = getRandomMove();
                return [...move, message];  // Spread the move array and add message
            }
        
            // check for winning move (Predator always takes winning moves)
            const winningMove = findWinningMove(predator.getToken());
            if (winningMove) {
                const message = "moves in for the kill!";
                return [...winningMove, message];
            }
        
            // only sometimes block the Alien (makes it more interesting)
            if (aggressiveness > 0.3) {
                const blockingMove = findWinningMove(alien.getToken());
                if (blockingMove) {
                    const message = "blocks the Alien's attack!";
                    return [...blockingMove, message];
                }
            }
        
            // take center or corners with some probability
            if (aggressiveness > 0.5) {
                if (isCenterAvailable()) {
                    const message = "takes a strategic position!";
                    return [1, 1, message];
                }
                const cornerMoves = getCornerMoves();
                if (cornerMoves.length > 0) {
                    const message = "moves to higher ground!";
                    const move = cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
                    return [...move, message];
                }
            }
        
            // otherwise take any available move
            const message = "makes a tactical move...";
            const move = getRandomMove();
            return [...move, message];
        };
        
        return {getBestMove};
        
    })();
    
    // ---|| GAMEBOARD MODULE IIFE ||---
    const Gameboard = (function () {
        // cell factory
        const cell = () => {
            let value = '';

            const setValue = (player) => {
                value = player;
            };

            const getValue = () => value;

            return {setValue, getValue};
        };

        const rows = 3;
        const cols = 3;
        let gameboard = [];

        // initialise board with empty cells
        const initBoard = () => {
            gameboard = [];
            for (let i = 0; i < rows; i++) {
                gameboard[i] = [];
                for (let j = 0; j < cols; j++) {
                    gameboard[i].push(cell());
                }
            }
        };

        // initialise board
        initBoard();

        // print board
        const printBoard = () => {
            const boardState = gameboard.map(row => 
                row.map(cell => cell.getValue() || '-').join(' ')
            ).join('\n');
            console.log(boardState);
        };

        const dropToken = (row, col, player) => {
            // Always allow setting to empty (for undo)
            if (player === '') {
                gameboard[row][col].setValue('');
                return true;
            }
            
            // For actual moves, only allow if cell is empty
            if (gameboard[row][col].getValue() === '') {
                gameboard[row][col].setValue(player);
                return true;
            }
            return false;
        };
        
        const checkWin = (token) => {
            // check rows
            for (let i = 0; i < 3; i++) {
                if (gameboard[i][0].getValue() === token &&
                    gameboard[i][1].getValue() === token &&
                    gameboard[i][2].getValue() === token) {
                    return true;
                }
            }
            
            // check columns
            for (let i = 0; i < 3; i++) {
                if (gameboard[0][i].getValue() === token &&
                    gameboard[1][i].getValue() === token &&
                    gameboard[2][i].getValue() === token) {
                    return true;
                }
            }
            
            // check diagonals
            if (gameboard[0][0].getValue() === token &&
                gameboard[1][1].getValue() === token &&
                gameboard[2][2].getValue() === token) {
                return true;
            }
            
            if (gameboard[0][2].getValue() === token &&
                gameboard[1][1].getValue() === token &&
                gameboard[2][0].getValue() === token) {
                return true;
            }
            
            return false;
        };

        const isBoardFull = () => {
            return gameboard.every(row => 
                row.every(cell => cell.getValue() !== '')
            );
        };

        const getCellValue = (row, col) => {
            return gameboard[row][col].getValue();
        };

        return {
            dropToken,
            printBoard,
            checkWin,
            isBoardFull,
            initBoard,
            getCellValue
        };
    })();

    // --- || DISPLAY CONTROLLER ||---
    const DisplayController = (function() {
        const createBoard = () => {
            const board = document.getElementById('game-board');
            if (!board) {
                console.error('Game board element not found!');
                return;
            }
            for(let i = 0; i < 3; i++) {
                for(let j = 0; j < 3; j++) {
                    const cell = document.createElement('button');
                    cell.classList.add('cell');
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    cell.addEventListener('click', () => {
                        if (TicTacToe.playRound(i, j)) {
                            updateDisplay();
                        }
                    });
                    board.appendChild(cell);
                }
            }
        };
        
        const addResetScoresButton = () => {
            const resetScores = document.createElement('button');
            resetScores.textContent = 'Reset Scores';
            resetScores.addEventListener('click', () => {
                localStorage.removeItem('alienWins');
                localStorage.removeItem('predatorWins');
                document.getElementById('alien-score').textContent = 'Xenomorph: 0';
                document.getElementById('predator-score').textContent = 'Predator: 0';
            });
        };

        const initScores = () => {
            // get scores from localStorage or default to 0
            const scores = {
                alien: localStorage.getItem('alienWins') || 0,
                predator: localStorage.getItem('predatorWins') || 0
            };
            
            // create score displays
            const scoreBoard = document.createElement('div');
            scoreBoard.id = 'score-board';
            const gameBoard = document.getElementById('game-board');
            
            const alienScore = document.createElement('div');
            alienScore.id = 'alien-score';
            alienScore.textContent = `Xenomorph: ${scores.alien}`;
            
            const predatorScore = document.createElement('div');
            predatorScore.id = 'predator-score';
            predatorScore.textContent = `Predator: ${scores.predator}`;
            
            scoreBoard.appendChild(alienScore);
            scoreBoard.appendChild(predatorScore);
            gameBoard.parentNode.insertBefore(scoreBoard, gameBoard);
        };

        const updateScore = (winner) => {
            // Map the winner name to the correct score ID
            const scoreId = winner === 'Xenomorph' ? 'alien-score' : 'predator-score';
            const key = winner === 'Xenomorph' ? 'alienWins' : 'predatorWins';
            
            const currentScore = parseInt(localStorage.getItem(key) || 0);
            localStorage.setItem(key, currentScore + 1);
            
            const scoreElement = document.getElementById(scoreId);
            if (scoreElement) {
                scoreElement.textContent = `${winner}: ${currentScore + 1}`;
            } else {
                console.error('Score element not found for:', winner);
            }
        };
        

        const updateDisplay = () => {
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                const row = cell.dataset.row;
                const col = cell.dataset.col;
                const value = Gameboard.getCellValue(row, col);
                if (value) {
                    cell.innerHTML = value;  // using innerHTML instead of textContent to render the SVG
                } else {
                    cell.innerHTML = '';
                }
            });
        };
    
        const init = () => {
            createBoard();
            initScores();
            
            const resetBtn = document.getElementById('reset-btn');
            const aiToggle = document.getElementById('ai-toggle');
            const resetScores = document.getElementById('reset-scores');
            
            if (!resetBtn || !aiToggle || !resetScores) {
                console.error('Control buttons not found!');
                return;
            }
    
            resetBtn.addEventListener('click', () => {
                TicTacToe.resetGame();
                updateDisplay();
            });
    
            aiToggle.addEventListener('click', (e) => {
                const isAI = e.target.classList.toggle('active');
                TicTacToe.setVsAI(isAI);
                updateDisplay();
            });

            resetScores.addEventListener('click', () => {
                localStorage.removeItem('alienWins');
                localStorage.removeItem('predatorWins');
                document.getElementById('alien-score').textContent = 'Xenomorph: 0';
                document.getElementById('predator-score').textContent = 'Predator: 0';
            });
        };

        const updateMode = (message) => {
            const modeDisplay = document.getElementById('mode-display');
            if (modeDisplay) {
                modeDisplay.textContent = message;
            }
        };
    
        const updateStatus = (message) => {
            const status = document.getElementById('status-display');
            if (status) {
                status.textContent = message;
            }
        };

        const announceWinner = (player) => {
            const playerChar = player.getChar();
            const message = player.getChar() === 'Xenomorph' 
                ? "The perfect organism has prevailed... Xenomorph Wins!"
                : "Victory claimed with honour... Predator Wins!";
            console.log(message);
            DisplayController.updateStatus(message);
            DisplayController.updateScore(playerChar); 
        };
        
        return {init, 
            initScores,
            updateScore,
            updateDisplay,
            updateMode,
            updateStatus,
            announceWinner,
            addResetScoresButton
        };
    })();

    // GAME CONTROLLER
    const GameController = (function(AI, DisplayController) {
        let activePlayer = alien;
        let gameOver = false;
        let vsAI = false;



        const switchPlayerTurn = () => {
            activePlayer = activePlayer === alien ? predator : alien;
        };

        const getActivePlayer = () => activePlayer;
        
        const playRound = (row, col) => {
            console.log(`Starting round at [${row}, ${col}] by ${activePlayer.getChar()}`);
            
            if (gameOver) {
                DisplayController.updateStatus("Game is over! Start a new game.");
                return false;
            }
        
            // check if move is valid first
            if (!Gameboard.dropToken(row, col, activePlayer.getToken())) {
                DisplayController.updateStatus("Invalid move! Position already taken!");
                return false;
            }

            DisplayController.updateDisplay(); 
        
            console.log(`Valid move made by ${activePlayer.getChar()} at [${row}, ${col}]`);
            DisplayController.updateStatus(`${activePlayer.getChar()} ${activePlayer === alien ? 'hisses and attacks' : 'attacks with plasma cannon'}`);
        
            if (checkGameEnd()) {
                return true;
            }
            
            switchPlayerTurn();
            console.log(`Turn switched to ${activePlayer.getChar()}`);
        
            // AI move
            if (vsAI && activePlayer === predator && !gameOver) {
                console.log('AI turn starting');
                const [aiRow, aiCol, message] = AI.getBestMove(); 
                if (aiRow !== undefined && aiCol !== undefined) {
                    console.log(`AI attempting move at [${aiRow}, ${aiCol}]`);
                    Gameboard.dropToken(aiRow, aiCol, activePlayer.getToken());
                    DisplayController.updateStatus(`${activePlayer.getChar()} ${message}`);                    
                    if (checkGameEnd()) {
                        return true;
                    }
                    
                    switchPlayerTurn();
                    console.log('AI turn completed');
                }
            }
        
            return true;
        };
        
        const checkGameEnd = () => {
            console.log("Checking game end for token:", activePlayer.getToken());
            const isWin = Gameboard.checkWin(activePlayer.getToken());
            console.log("Is win:", isWin);
            if (isWin) {
                DisplayController.announceWinner(activePlayer);
                gameOver = true;
                return true;
            }
            if (Gameboard.isBoardFull()) {
                console.log("The hunt ends in a stalemate.");
                DisplayController.updateStatus("The hunt ends in a stalemate.");
                gameOver = true;
                return true;
            }
            return false;
        };
    
        const resetGame = () => {
            Gameboard.initBoard();  
            gameOver = false;      
            activePlayer = alien;
            DisplayController.updateStatus("New battle started!"); 
            Gameboard.printBoard();
        };
    
        const setVsAI = (enabled) => {
            vsAI = enabled;
            resetGame();
            DisplayController.updateMode(
                enabled 
                    ? "AI mode" 
                    : "Two player mode"
            );
        };        
    
        return {
            playRound,
            getActivePlayer,
            resetGame,
            setVsAI
        };
    })(AI, DisplayController);

    return {
        playRound: GameController.playRound,
        printBoard: Gameboard.printBoard,
        resetGame: GameController.resetGame,
        setVsAI: GameController.setVsAI,
        init: DisplayController.init
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    TicTacToe.init();
});
