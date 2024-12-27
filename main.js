const TicTacToe = (function() {
    // player factory
    const Player = (char, token) => {
        const getChar = () => char;
        const getToken = () => token;
        const getMove = () => {
            if (char === 'Alien') return 'hisses and attacks';
            if (char === 'Predator') return 'attacks with plasma cannon';
        };
        return {getChar, getToken, getMove};
    };

    // create characters
    const alien = Player('Alien', 'X');
    const predator = Player('Predator', 'O');

    const AI = (function() {
        const getRandomMove = () => {
            const availableMoves = [];
            
            // get all empty cells
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (Gameboard.getCellValue(i, j) === '') {
                        availableMoves.push([i, j]);
                    }
                }
            }
            
            // return random available move
            if (availableMoves.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableMoves.length);
                return availableMoves[randomIndex];
            }
            return null;
        };

        return {getRandomMove};
    })();

    // gameboard module IIFE
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

        // make move
        const dropToken = (row, col, player) => {
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

    const GameController = (function() {
        let activePlayer = alien;
        let gameOver = false;
        let vsAI = false;

        const announceWinner = (player) => {
            if (player.getChar() === 'Alien') {
                console.log("The perfect organism has prevailed... Xenomorph Wins!");
            } else {
                console.log("Victory claimed with honor... Predator Wins!");
            }
        };

        const switchPlayerTurn = () => {
            activePlayer = activePlayer === alien ? predator : alien;
        };

        const getActivePlayer = () => activePlayer;

        const playRound = (row, col) => {
            if (gameOver) {
                console.log("Game is over! Start a new game.");
                return false;
            }

            // human move
            if (Gameboard.dropToken(row, col, activePlayer.getToken())) {
                console.log(`${activePlayer.getChar()} ${activePlayer.getMove()} position [${row}, ${col}]`);
                Gameboard.printBoard();

                if (checkGameEnd()) return true;
                
                switchPlayerTurn();

                // AI move
                if (vsAI && activePlayer === predator) {
                    setTimeout(() => {
                        const [aiRow, aiCol] = AI.getRandomMove();
                        Gameboard.dropToken(aiRow, aiCol, activePlayer.getToken());
                        console.log(`${activePlayer.getChar()} ${activePlayer.getMove()} position [${aiRow}, ${aiCol}]`);
                        Gameboard.printBoard();

                        if (!checkGameEnd()) {
                            switchPlayerTurn();
                        }
                    }, 500); // half second delay for better UX
                }

                return true;
            }
            console.log("Invalid move! Position already taken!");
            return false;
        };

        // helper to check win/draw conditions
        const checkGameEnd = () => {
            if (Gameboard.checkWin(activePlayer.getToken())) {
                announceWinner(activePlayer);
                gameOver = true;
                return true;
            }
            if (Gameboard.isBoardFull()) {
                console.log("The hunt ends in stalemate.");
                gameOver = true;
                return true;
            }
            return false;
        };

        const resetGame = () => {
            Gameboard.initBoard();  
            gameOver = false;      
            activePlayer = alien;
            console.log("New battle started!");
            Gameboard.printBoard();
        };

        const setVsAI = (enabled) => {
            vsAI = enabled;
            resetGame();
            console.log(enabled ? "AI mode enabled - Predator will play automatically" : "AI mode disabled - Two player mode");
        };
    
        return {
            playRound,
            getActivePlayer,
            resetGame,
            setVsAI
        };
    })();
    
    return {
        playRound: GameController.playRound,
        printBoard: Gameboard.printBoard,
        resetGame: GameController.resetGame,
        setVsAI: GameController.setVsAI
    };
})();