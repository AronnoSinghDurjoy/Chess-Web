const board = document.getElementById('board');
let selectedPiece = null;

const pieces = [
    '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖',
    '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
    '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'
];

for (let i = 0; i < 64; i++) {
    const square = document.createElement('div');
    square.classList.add('square');
    if ((i + Math.floor(i / 8)) % 2 === 0) {
        square.classList.add('white');
    } else {
        square.classList.add('black');
    }
    square.innerText = pieces[i];
    square.dataset.index = i;
    square.addEventListener('click', () => handleSquareClick(square));
    board.appendChild(square);
}

function handleSquareClick(square) {
    if (!selectedPiece && square.innerText) {
        if (square.innerText === '♙' || square.innerText === '♟') {
            // Handle pawn moves
            selectPiece(square);
            const index = parseInt(square.dataset.index);
            const direction = square.innerText === '♙' ? -8 : 8;
            if (!board.children[index + direction].innerText) {
                board.children[index + direction].classList.add('selected');
                board.children[index + direction].addEventListener('click', () => movePiece(square, board.children[index + direction]));
            }
        } else {
            // Handle other piece moves
            selectPiece(square);
            const index = parseInt(square.dataset.index);
            const possibleMoves = calculatePossibleMoves(square);
            possibleMoves.forEach(moveIndex => {
                if (!board.children[moveIndex].innerText || isOpponentPiece(square, board.children[moveIndex])) {
                    board.children[moveIndex].classList.add('selected');
                    board.children[moveIndex].addEventListener('click', () => movePiece(square, board.children[moveIndex]));
                }
            });
        }
    } else if (selectedPiece === square) {
        // Deselect piece
        deselectPiece(square);
    }
}

function selectPiece(square) {
    selectedPiece = square;
    square.classList.add('selected');
}

function deselectPiece(square) {
    selectedPiece = null;
    square.classList.remove('selected');
    removeSelectedHighlights();
}

function removeSelectedHighlights() {
    const selectedSquares = document.querySelectorAll('.selected');
    selectedSquares.forEach(square => {
        square.classList.remove('selected');
        square.removeEventListener('click', () => {});
    });
}

function movePiece(fromSquare, toSquare) {
    toSquare.innerText = fromSquare.innerText;
    fromSquare.innerText = '';
    removeSelectedHighlights();
    deselectPiece(selectedPiece);
}


function isOpponentPiece(square1, square2) {
    return (square1.innerText === '♙' && square2.innerText === '♟') || (square1.innerText === '♟' && square2.innerText === '♙');
}

function calculatePossibleMoves(square) {
    const index = parseInt(square.dataset.index);
    const piece = square.innerText;

    switch (piece) {
        case '♙':
        case '♟':
            return calculatePawnMoves(index, piece);
        case '♖':
        case '♜':
            return calculateRookMoves(index);
        case '♘':
        case '♞':
            return calculateKnightMoves(index);
        case '♗':
        case '♝':
            return calculateBishopMoves(index);
        case '♕':
        case '♛':
            return calculateQueenMoves(index);
        case '♔':
        case '♚':
            return calculateKingMoves(index);
        default:
            return [];
    }
}

function calculatePawnMoves(index, piece) {
    const direction = (piece === '♙') ? -1 : 1;
    const possibleMoves = [];

    // Check if pawn can move one square forward
    if (!board.children[index + 8 * direction].innerText) {
        possibleMoves.push(index + 8 * direction);
    }

    // Check if pawn can move two squares forward from starting position
    if ((piece === '♙' && index >= 48 && index <= 55) || (piece === '♟' && index >= 8 && index <= 15)) {
        if (!board.children[index + 16 * direction].innerText && !board.children[index + 8 * direction].innerText) {
            possibleMoves.push(index + 16 * direction);
        }
    }

    // Check if pawn can capture diagonally
    if (board.children[index + 7 * direction].innerText && isOpponentPiece(board.children[index], board.children[index + 7 * direction])) {
        possibleMoves.push(index + 7 * direction);
    }
    if (board.children[index + 9 * direction].innerText && isOpponentPiece(board.children[index], board.children[index + 9 * direction])) {
        possibleMoves.push(index + 9 * direction);
    }

    return possibleMoves;
}

function calculateRookMoves(index) {
    const possibleMoves = [];
    const directions = [-1, 1, -8, 8];

    directions.forEach(direction => {
        let nextIndex = index + direction;
        while (isValidSquare(nextIndex) && !board.children[nextIndex].innerText) {
            possibleMoves.push(nextIndex);
            nextIndex += direction;
        }
        if (isValidSquare(nextIndex) && isOpponentPiece(board.children[index], board.children[nextIndex])) {
            possibleMoves.push(nextIndex);
        }
    });

    return possibleMoves;
}

function calculateKnightMoves(index) {
    const possibleMoves = [];
    const offsets = [-17, -15, -10, -6, 6, 10, 15, 17];

    offsets.forEach(offset => {
        const nextIndex = index + offset;
        if (isValidSquare(nextIndex) && (!board.children[nextIndex].innerText || isOpponentPiece(board.children[index], board.children[nextIndex]))) {
            possibleMoves.push(nextIndex);
        }
    });

    return possibleMoves;
}

function calculateBishopMoves(index) {
    const possibleMoves = [];
    const directions = [-9, -7, 7, 9];

    directions.forEach(direction => {
        let nextIndex = index + direction;
        while (isValidSquare(nextIndex) && !board.children[nextIndex].innerText) {
            possibleMoves.push(nextIndex);
            nextIndex += direction;
        }
        if (isValidSquare(nextIndex) && isOpponentPiece(board.children[index], board.children[nextIndex])) {
            possibleMoves.push(nextIndex);
        }
    });

    return possibleMoves;
}

function calculateQueenMoves(index) {
    return calculateRookMoves(index).concat(calculateBishopMoves(index));
}

function calculateKingMoves(index) {
    const possibleMoves = [];
    const offsets = [-9, -8, -7, -1, 1, 7, 8, 9];

    offsets.forEach(offset => {
        const nextIndex = index + offset;
        if (isValidSquare(nextIndex) && (!board.children[nextIndex].innerText || isOpponentPiece(board.children[index], board.children[nextIndex]))) {
            possibleMoves.push(nextIndex);
        }
    });

    return possibleMoves;
}

function isValidSquare(index) {
    return index >= 0 && index < 64;
}

function isOpponentPiece(square1, square2) {
    return (square1.innerText === '♙' && square2.innerText === '♟') || (square1.innerText === '♟' && square2.innerText === '♙') ||
           (square1.innerText === '♖' && square2.innerText === '♜') || (square1.innerText === '♜' && square2.innerText === '♖') ||
           (square1.innerText === '♘' && square2.innerText === '♞') || (square1.innerText === '♞' && square2.innerText === '♘') ||
           (square1.innerText === '♗' && square2.innerText === '♝') || (square1.innerText === '♝' && square2.innerText === '♗') ||
           (square1.innerText === '♕' && square2.innerText === '♛') || (square1.innerText === '♛' && square2.innerText === '♕') ||
           (square1.innerText === '♔' && square2.innerText === '♚') || (square1.innerText === '♚' && square2.innerText === '♔');
}