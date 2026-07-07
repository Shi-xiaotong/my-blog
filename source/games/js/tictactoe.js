var board, currentPlayer, gameOver, mode, scores, winLine;

var WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function init() {
  scores = JSON.parse(localStorage.getItem('tictactoe_scores') || '{"x":0,"o":0,"d":0}');
  mode = 'ai';
  updateScoreDisplay();
  newGame();
}

function newGame() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  winLine = null;
  render();
  setStatus(mode === 'ai' ? '你的回合 (X)' : 'X 的回合');
}

function setMode(m) {
  mode = m;
  document.querySelectorAll('.mode-btns button').forEach(b => b.classList.remove('active'));
  document.querySelector(`.mode-btns button[onclick="setMode('${m}')"]`).classList.add('active');
  newGame();
}

function render() {
  var el = document.getElementById('board');
  el.innerHTML = board.map((v, i) => {
    var cls = 'cell';
    if (v) cls += ' taken ' + v.toLowerCase();
    if (winLine && winLine.includes(i)) cls += ' win';
    return `<div class="${cls}" onclick="playMove(${i})">${v}</div>`;
  }).join('');
}

function setStatus(msg) { document.getElementById('status').textContent = msg; }

function playMove(i) {
  if (gameOver || board[i]) return;
  if (mode === 'ai' && currentPlayer === 'O') return;

  board[i] = currentPlayer;
  render();

  var result = checkWin();
  if (result) { handleResult(result); return; }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  if (mode === 'ai' && currentPlayer === 'O') {
    setStatus('电脑思考中...');
    setTimeout(aiMove, 300);
  } else {
    setStatus(`${currentPlayer} 的回合`);
  }
}

var moveCount = 0;

async function aiMove() {
  if (gameOver) return;
  var best = minimax(board, 'O', 0);
  board[best.index] = 'O';
  moveCount++;
  render();

  var result = checkWin();
  if (result) { handleResult(result); return; }

  currentPlayer = 'X';
  setStatus('你的回合 (X)');

  // AI 垃圾话（异步，不阻塞）
  if (typeof getTicTacToeTaunt === 'function') {
    getTicTacToeTaunt(moveCount).then(taunt => {
      if (taunt && !gameOver) setStatus('AI: ' + taunt);
    });
  }
}

function checkWin() {
  for (var [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a], line: [a, b, c] };
  }
  if (board.every(v => v)) return { winner: 'draw', line: null };
  return null;
}

function handleResult(result) {
  gameOver = true;
  winLine = result.line;
  moveCount = 0;
  render();

  var won = result.winner === 'X';
  var draw = result.winner === 'draw';

  if (draw) {
    setStatus('平局!');
    scores.d++;
  } else if (won) {
    setStatus(mode === 'ai' ? '你赢了!' : 'X 获胜!');
    scores.x++;
  } else {
    setStatus(mode === 'ai' ? '电脑赢了!' : 'O 获胜!');
    scores.o++;
  }

  // AI 点评（异步）
  if (mode === 'ai' && typeof getGameComment === 'function') {
    getGameComment('井字棋', won ? '赢' : draw ? '平' : '输', won).then(msg => {
      if (msg) setStatus(msg);
    });
  }

  localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
  updateScoreDisplay();
}

function updateScoreDisplay() {
  document.getElementById('scoreX').textContent = scores.x;
  document.getElementById('scoreO').textContent = scores.o;
  document.getElementById('scoreD').textContent = scores.d;
}

function resetScore() {
  scores = { x: 0, o: 0, d: 0 };
  localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
  updateScoreDisplay();
}

// Minimax AI
function minimax(boardState, player, depth) {
  var result = checkWinState(boardState);
  if (result === 'O') return { score: 10 - depth };
  if (result === 'X') return { score: depth - 10 };
  if (boardState.every(v => v)) return { score: 0 };

  var moves = [];
  var nextPlayer = player === 'O' ? 'X' : 'O';

  for (var i = 0; i < 9; i++) {
    if (boardState[i]) continue;
    boardState[i] = player;
    var { score } = minimax(boardState, nextPlayer, depth + 1);
    moves.push({ index: i, score });
    boardState[i] = '';
  }

  if (player === 'O') return moves.reduce((best, m) => m.score > best.score ? m : best);
  return moves.reduce((best, m) => m.score < best.score ? m : best);
}

function checkWinState(b) {
  for (var [a, c, d] of WINS) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

init();