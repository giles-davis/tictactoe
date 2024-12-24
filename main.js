//player factory
const Player = (char, token) => {
    const getChar = () => char;
    const getToken = () => token;
    return {getChar, getToken};
};

//create characters
const alien = Player('Alien', 'X');
const predator = Player('Predator', 'O');

//gameboard module IIFE
const Gameboard = (function () {
    //cell factory
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
    const gameboard = [];

    //initialise board with empty cells
    for (let i = 0; i < rows; i++) {
        gameboard[i] = [];
        for (let j = 0; j < cols; j++) {
            gameboard[i].push(cell());
        }
    }

    //print board
    const printBoard = () => {
        const boardState = gameboard.map(row => 
            row.map(cell => cell.getValue() || '-').join(' ')
        ).join('\n');
        console.log(boardState);
    };

    //make move
    const dropToken = (row, col, player) => {
        if (gameboard[row][col].getValue() === '') {
            gameboard[row][col].setValue(player);
            return true;
        }
        return false;
    };

    return {dropToken, printBoard}
})();

