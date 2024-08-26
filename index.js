let lastTime = 0;
let score = 0;
let level = 0;
let isGameWon = false;
const WIDTH = window.innerWidth - 17;
const HEIGHT = window.innerHeight - 17;
let gameOver = true
const BALL_RADIUS = 6
const BALL_PROP = {
    radius: BALL_RADIUS,
    diameter: BALL_RADIUS * 2,
}
const BOTTOM_LINE = HEIGHT - 50
const BRICK_SIZE = {
    width: 60,
    height: 20
}
const TREASURE_CHANCE = 1 - 0.2

let balls = []
const BOARD_WIDTH = 150
let board = {
    x: WIDTH / 2 - BOARD_WIDTH / 2 + BALL_RADIUS,
    y: BOTTOM_LINE,
    speed: 5,
    dx: 1,
    dy: 1,
    width: BOARD_WIDTH,
    height: 10,
    bottom: 50 - BALL_RADIUS,
    step: 30
}
let bricks = []

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function detectArrowKeys(event) {
    if (!gameOver) {

        if (event.key === 'ArrowLeft') {
            console.log('Left arrow key pressed');
            board.x = Math.max(board.x - board.step, 0)
        } else if (event.key === 'ArrowRight') {
            console.log('Right arrow key pressed');
            board.x = Math.min(board.x + board.step, (WIDTH - board.width) + 20)
        }
    }
}

document.addEventListener('keydown', detectArrowKeys);

function handleTouchMove(event) {
    if (!gameOver) {
        board.x = event.touches[0].clientX - board.width / 2
    }
}
document.addEventListener('touchmove', handleTouchMove);


let fpsUpdating = true;
function getFrameRate() {
    const now = performance.now();
    const fps = 1000 / (now - lastTime);
    lastTime = now;
    return fps;
}
function createElm(parent, text, classes) {
    return $('<div>', { text }).addClass(classes).appendTo(parent);
}
function createBrick() {
    return createElm('#con', '', 'item').css({ width: BRICK_SIZE.width, height: BRICK_SIZE.height, background: getRandomColor() })
}

// createElm('WTH')

function moveBall(ball) {
    ball.x += Math.min(ball.speed * ball.dx, WIDTH);
    ball.y += Math.min(ball.speed * ball.dy, HEIGHT);
    if (ball.x > WIDTH || ball.x < 0) ball.dx *= -1;
    if (ball.y > HEIGHT || ball.y < 0) ball.dy *= -1;
    if (ball.y > BOTTOM_LINE + 10) {
        if (balls.length > 1) {
            removeBall(ball.id)
        } else {
            gameOver = true
        }
    }
    return ball;
}
function getRandomString(length) {
    return Math.random().toString(36).substring(2, 2 + length);
}

function getBall() {
    return {
        id: getRandomString(15),
        x: WIDTH / 2,
        y: BOTTOM_LINE - 1,
        speed: 5,
        dx: 1,
        dy: -1,
        el: createElm('body', '', 'ball').css({ width: BALL_PROP.diameter, height: BALL_PROP.diameter })
    }
}

function addBall() {
    balls.push(getBall())
}
function removeBall(id) {
    balls = balls.filter(b => {
        if (b.id === id) {
            b.el.remove()
            return false;
        }
        return true;
    })
}
function play() {
    $('#con').empty();
    for (const { el } of balls) {
        el.remove()
    }
    gameOver = false;
    balls = [getBall()]
    board = {
        x: WIDTH / 2 - BOARD_WIDTH / 2 + BALL_RADIUS,
        y: BOTTOM_LINE,
        speed: 5,
        dx: 1,
        dy: 1,
        width: BOARD_WIDTH,
        height: 10,
        bottom: 50 - BALL_RADIUS,
        step: 20
    }
    if (!isGameWon) {
        score = 0;
        level = 0;
    }
    bricks = []
    for (const _ of Array(25 + level * 2)) {

        const b = createBrick()
        const treasure = Math.random() > TREASURE_CHANCE
        if (treasure) b.addClass('treasure')
        bricks.push({ el: b, visible: true, treasure })
    }
}
function btn(a, x, b) {
    return a <= x && x <= b
}
function edgeCollision(aOne, bOne, aTwo, bTwo) {
    return Math.min(Math.abs(aOne - bTwo), Math.abs(aTwo - bOne))
}
function detectBrickCollision() {
    for (const ball of balls) {

        const { x, y } = ball
        const { width, height } = BRICK_SIZE
        const { radius } = BALL_PROP
        for (const brick of bricks) {
            const { top, left } = brick.el.position()

            const xAxis = edgeCollision(x - radius, x + radius, left, left + width)
            const yAxis = edgeCollision(y - radius, y + radius, top, top + height)
            if (
                brick.visible &&
                (
                    btn(left, x - radius, left + width)
                    || btn(left, x + radius, left + width)
                )
                &&
                (
                    btn(top, y - radius, top + height)
                    || btn(top, y + radius, top + height)
                )) {
                score += 1;
                localStorage.score = Math.max(Number(localStorage.score) || 0, score);
                if (xAxis > yAxis) {
                    ball.dy *= -1
                } else {
                    ball.dx *= -1
                }
                brick.el.css({ visibility: 'hidden' })
                if (brick.treasure) {
                    addBall()
                }
                brick.visible = false
            }
        }
        if ((
            btn(board.x, x - radius, board.x + BOARD_WIDTH)
            || btn(board.x, x + radius, board.x + BOARD_WIDTH)
        )
            &&
            (
                btn(board.y, y - radius, board.y + board.height)
                || btn(board.y, y + radius, board.y + board.height)
            )) {
            ball.dy = -1;
            boardElm.animate({ background: '#6f1010' }, 100)
        } else {
            boardElm.animate({ background: '#000' }, 100)
        }
    }
}
function checkGameWon() {
    if (!gameOver) {
        for (const { visible } of bricks) {
            isGameWon = false;
            if (visible) return;
        }
        level += 1
        gameOver = true;
        isGameWon = true;
    }
}
const boardElm = $('#board')
const hr = $('#hr')
hr.css({ bottom: board.bottom })
boardElm.css({ width: board.width, height: board.height, bottom: board.bottom })
const modal = $('#modal')
$('#modal-button').click(play)


function gameLoop() {
    const fps = getFrameRate();
    if (fpsUpdating) {
        $('#fps').html(`FPS: ${fps.toFixed(2)}`)
        fpsUpdating = false;
        $('#scoreHighest').html(localStorage.score || 0)
        setTimeout(() => fpsUpdating = true, 1000)
    }
    checkGameWon()
    $('#levelNow').html(level)
    $('#scoreNow').html(score)
    if (!gameOver) {
        for (const ball of balls) {
            moveBall(ball);
        }
        modal.css({ display: "none" })
    } else {
        modal.css({ display: "flex" })
        $('#levelFinal').html(level)
        $('#scoreFinal').html(score)
        if (isGameWon) {
            $('#modal-title').html('Well Done!')
            $('#modal-button').addClass('next')
        } else {
            $('#modal-title').html('Game Over!')
            $('#modal-button').removeClass('next')
        }
    }

    detectBrickCollision()
    for (const { y, x, el } of balls) {
        el.css({ top: y, left: x })
    }
    boardElm.css({ left: board.x })

    requestAnimationFrame(gameLoop);
}
play()
requestAnimationFrame(gameLoop);