const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const ROW = 20; // HÀNG
const COL = 10; // CỘT
const SQ = 30; // KÍCH THƯỚC Ô
const COLOR = 'WHITE'; // MÀU Ô

let score = 0; // Initial score
const ROWS_CLEARED_POINTS = 10; // Points for clearing one row


// Vẽ ô vuông
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    ctx.strokeStyle = "black";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// Tạo mảng 2 chiều cho game board
let board = [];
for (let i = 0; i < ROW; i++) {
    board[i] = [];
    for (let j = 0; j < COL; j++) {
        board[i][j] = COLOR;
    }
}

// Vẽ game board
function drawBoard() {
    for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
            drawSquare(j, i, board[i][j]);
        }
    }
    drawScore();
}

drawBoard();

// Định nghĩa các hình khối Tetris
const Z = [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
];

const S = [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
];

const J = [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
];

const T = [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
];

const L = [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
];

const I = [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]]
];

const O = [
    [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
];

// Định nghĩa màu cho từng khối hình
const PIECES = [
    [Z, 'red'],
    [S, 'green'],
    [T, 'yellow'],
    [O, 'blue'],
    [L, 'orange'],
    [I, 'cyan'],
    [J, 'purple']
];

class Piece {
    constructor(tetromino, color) {
        this.tetromino = tetromino;
        this.color = color;
        this.tetrominoN = 0; // Chỉ số góc quay đầu
        this.activeTetromino = this.tetromino[this.tetrominoN]; // Lấy góc quay và gán

        // Tọa độ đầu xét vẽ hình
        this.x = 3;
        this.y = -2; // Vẽ hình ngoài canvas
    }

    // Duyệt qua mảng activeTetromino tạo khối hình
    fill(color) {
        for (let i = 0; i < this.activeTetromino.length; i++) {
            for (let j = 0; j < this.activeTetromino[i].length; j++) {
                if (this.activeTetromino[i][j]) {
                    drawSquare(this.x + j, this.y + i, color);
                }
            }
        }
    }

    draw() {
        this.fill(this.color);
    }

    unDraw() {
        this.fill(COLOR);
    }

    moveDown() {
        if (!this.collision(0, 1, this.activeTetromino)) {
            this.unDraw();
            this.y++;
            this.draw();
        } else {
            this.lock();
            p = randomPiece();
        }
    }

    moveRight() {
        if (!this.collision(1, 0, this.activeTetromino)) {
            this.unDraw();
            this.x++;
            this.draw();
        }
    }

    moveLeft() {
        if (!this.collision(-1, 0, this.activeTetromino)) {
            this.unDraw();
            this.x--;
            this.draw();
        }
    }

    rotate() {
        let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
        if (!this.collision(0, 0, nextPattern)) {
            this.unDraw();
            this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
            this.activeTetromino = this.tetromino[this.tetrominoN];
            this.draw();
        }
    }

    lock() {
        for (let i = 0; i < this.activeTetromino.length; i++) {
            for (let j = 0; j < this.activeTetromino[i].length; j++) {
                if (!this.activeTetromino[i][j]) {
                    continue;
                }
                if (this.y + i < 0) { // Va chạm thành trên
                    alert("Game Over");
                    gameOver = true;
                    break;
                }
                board[this.y + i][this.x + j] = this.color;
            }
        }
        removeFullRows();
    }

    collision(x, y, piece) {
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (!piece[i][j]) {
                    continue;
                }
                let newX = this.x + j + x;
                let newY = this.y + i + y;

                if (newX < 0 || newX >= COL || newY >= ROW) {
                    return true;
                }

                if (newY < 0) {
                    continue;
                }

                if (board[newY][newX] != COLOR) {
                    return true;
                }
            }
        }
        return false;
    }
}

// Random hình đầu tiên
function randomPiece() {
    let r = Math.floor(Math.random() * PIECES.length);
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();
console.log(p);

// Nhấn phím sang trái, phải, thay đổi hình, xuống
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 37) {
        p.moveLeft();
    } else if (e.keyCode == 38) {
        p.rotate();
    } else if (e.keyCode == 39) {
        p.moveRight();
    } else if (e.keyCode == 40) {
        p.moveDown();
    }
});

function removeFullRows() {
    outer: for (let row = ROW - 1; row >= 0; row--) {
        for (let col = 0; col < COL; col++) {
            if (board[row][col] === COLOR) {
                continue outer;
            }
        }
        board.splice(row, 1);
        board.unshift(new Array(COL).fill(COLOR));
        score += ROWS_CLEARED_POINTS;
        drawBoard();
    }
}


let gameOver = false;
let interval;

// Chạy game
function drop() {
    interval = setInterval(function () {
        if (!gameOver) {
            p.moveDown();
        } else {
            clearInterval(interval);
        }
    }, 1000);
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    document.getElementById('score').innerHTML= score;
}

drop();
