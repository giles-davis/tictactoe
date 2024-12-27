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
        // check if a move would win
        const wouldWin = (token, row, col) => {
            // save current state
            const currentValue = Gameboard.getCellValue(row, col);
            
            // temporarily make move
            Gameboard.dropToken(row, col, token);
            const winning = Gameboard.checkWin(token);
            
            // undo move (restore original state)
            Gameboard.dropToken(row, col, currentValue);
            
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
            console.log("AI looking for best move...");
            // check for winning move
            const winningMove = findWinningMove(predator.getToken());
            if (winningMove) {
                console.log("Found winning move:", winningMove);
                return winningMove;
            }
        
            // 2. block opponent's winning move
            const blockingMove = findWinningMove(alien.getToken());
            if (blockingMove) {
                console.log("Found blocking move:", blockingMove);
                return blockingMove;
            }
        
            // 3. take center if available
            if (isCenterAvailable()) {
                console.log("Taking center");
                return [1, 1];
            }
        
            // 4. take random corner if available
            const cornerMoves = getCornerMoves();
            if (cornerMoves.length > 0) {
                const move = cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
                console.log("Taking corner:", move);
                return move;
            }
        
            // 5. take any available move
            const move = getRandomMove();
            console.log("Taking random move:", move);
            return move;
        };

        return {getBestMove};
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
            gameboard[row][col].setValue(player);
            return true;
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

    // GAME CONTROLLER
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
                    const [aiRow, aiCol] = AI.getBestMove();
                    console.log("AI chose move:", aiRow, aiCol); // Debug
                    if (aiRow !== undefined && aiCol !== undefined) {
                        const moveSuccess = Gameboard.dropToken(aiRow, aiCol, activePlayer.getToken());
                        console.log("AI move success:", moveSuccess); // Debug
                        console.log(`${activePlayer.getChar()} ${activePlayer.getMove()} position [${aiRow}, ${aiCol}]`);
                        Gameboard.printBoard();
        
                        if (!checkGameEnd()) {
                            switchPlayerTurn();
                        }
                    }
                }
        
                return true;
            }
            console.log("Invalid move! Position already taken!");
            return false;
        };
    
        const checkGameEnd = () => {
            console.log("Checking game end for token:", activePlayer.getToken()); // Debug
            const isWin = Gameboard.checkWin(activePlayer.getToken());
            console.log("Is win:", isWin); // Debug
            if (isWin) {
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
    })(AI);
    
    return {
        playRound: GameController.playRound,
        printBoard: Gameboard.printBoard,
        resetGame: GameController.resetGame,
        setVsAI: GameController.setVsAI
    };
})();