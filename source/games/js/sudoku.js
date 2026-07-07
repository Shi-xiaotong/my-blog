var puzzle, solution, board, pencilMarks, given, selectedRow, selectedCol, pencilMode, errors, maxErrors, history, seconds, timerInterval, difficulty;

function shuffle(arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

function generateSolution() {
  var grid = Array.from({length: 9}, () => Array(9).fill(0));
  function isValid(grid, row, col, num) {
    for (var i = 0; i < 9; i++) { if (grid[row][i] === num || grid[i][col] === num) return false; }
    var br = Math.floor(row/3)*3, bc = Math.floor(col/3)*3;
    for (var r = br; r < br+3; r++) for (var c = bc; c < bc+3; c++) { if (grid[r][c] === num) return false; }
    return true;
  }
  function solve(grid) {
    for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        var nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for (var n of nums) { if (isValid(grid, r, c, n)) { grid[r][c] = n; if (solve(grid)) return true; grid[r][c] = 0; } }
        return false;
      }
    }
    return true;
  }
  solve(grid);
  return grid;
}

function generatePuzzle(diff) {
  var sol = generateSolution();
  var puz = sol.map(r => [...r]);
  var cells = shuffle([...Array(81).keys()]);
  var remove = diff === 'easy' ? 35 : diff === 'medium' ? 45 : 55;
  for (var i = 0; i < remove; i++) { var idx = cells[i]; puz[Math.floor(idx/9)][idx%9] = 0; }
  return { puzzle: puz, solution: sol };
}

function newGame(diff) {
  difficulty = diff || 'easy';
  var d = generatePuzzle(difficulty);
  puzzle = d.puzzle;
  solution = d.solution;
  board = puzzle.map(r => [...r]);
  pencilMarks = Array.from({length: 9}, () => Array.from({length: 9}, () => new Set()));
  given = puzzle.map(r => r.map(v => v !== 0));
  selectedRow = -1; selectedCol = -1;
  pencilMode = false;
  errors = 0; maxErrors = 3;
  history = [];
  seconds = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => { seconds++; var m = Math.floor(seconds/60); var s = seconds%60; document.getElementById('timer').textContent = m + ':' + String(s).padStart(2,'0'); }, 1000);
  document.getElementById('diffLabel').textContent = difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难';
  document.getElementById('errors').textContent = errors + '/' + maxErrors;
  document.getElementById('overlay').style.display = 'none';
  renderNumpad();
  render();
}

function renderNumpad() {
  var el = document.getElementById('numpad');
  el.innerHTML = Array.from({length: 9}, (_, i) => `<button onclick="inputNum(${i+1})">${i+1}</button>`).join('') + '<button class="erase" onclick="eraseCell()">擦除</button>';
}

function render() {
  var el = document.getElementById('board');
  el.innerHTML = '';
  for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) {
    var cell = document.createElement('div');
    cell.className = 'cell';
    if (given[r][c]) cell.classList.add('given');
    else if (board[r][c] !== 0) cell.classList.add('user');
    if (r === selectedRow && c === selectedCol) cell.classList.add('selected');
    else if (r === selectedRow || c === selectedCol || (Math.floor(r/3) === Math.floor(selectedRow/3) && Math.floor(c/3) === Math.floor(selectedCol/3))) cell.classList.add('highlight');
    if (board[r][c] !== 0 && !given[r][c] && board[r][c] !== solution[r][c]) cell.classList.add('error');
    if (board[r][c] !== 0) {
      cell.textContent = board[r][c];
    } else if (pencilMarks[r][c].size > 0) {
      var pencil = document.createElement('div');
      pencil.className = 'pencil';
      for (var n = 1; n <= 9; n++) { var s = document.createElement('span'); s.textContent = pencilMarks[r][c].has(n) ? n : ''; pencil.appendChild(s); }
      cell.appendChild(pencil);
    }
    cell.onclick = () => selectCell(r, c);
    el.appendChild(cell);
  }
}

function selectCell(r, c) {
  selectedRow = r; selectedCol = c;
  render();
}

function inputNum(n) {
  if (selectedRow < 0 || selectedCol < 0 || given[selectedRow][selectedCol]) return;
  if (pencilMode) {
    var marks = pencilMarks[selectedRow][selectedCol];
    if (marks.has(n)) marks.delete(n); else marks.add(n);
    history.push({ type: 'pencil', row: selectedRow, col: selectedCol, n, added: marks.has(n) });
    render();
    return;
  }
  if (board[selectedRow][selectedCol] === n) return;
  history.push({ type: 'input', row: selectedRow, col: selectedCol, prev: board[selectedRow][selectedCol] });
  board[selectedRow][selectedCol] = n;
  pencilMarks[selectedRow][selectedCol].clear();
  // Clear pencil marks in same row/col/box
  for (var i = 0; i < 9; i++) { pencilMarks[selectedRow][i].delete(n); pencilMarks[i][selectedCol].delete(n); }
  var br = Math.floor(selectedRow/3)*3, bc = Math.floor(selectedCol/3)*3;
  for (var r = br; r < br+3; r++) for (var c = bc; c < bc+3; c++) pencilMarks[r][c].delete(n);
  if (n !== solution[selectedRow][selectedCol]) { errors++; document.getElementById('errors').textContent = errors + '/' + maxErrors; if (errors >= maxErrors) { clearInterval(timerInterval); setTimeout(() => alert('错误次数过多，游戏结束'), 100); } }
  render();
  checkWin();
}

function eraseCell() {
  if (selectedRow < 0 || selectedCol < 0 || given[selectedRow][selectedCol]) return;
  if (board[selectedRow][selectedCol] !== 0) {
    history.push({ type: 'input', row: selectedRow, col: selectedCol, prev: board[selectedRow][selectedCol] });
    board[selectedRow][selectedCol] = 0;
  }
  pencilMarks[selectedRow][selectedCol].clear();
  render();
}

function togglePencil() {
  pencilMode = !pencilMode;
  document.getElementById('pencilBtn').classList.toggle('active', pencilMode);
}

function undoMove() {
  if (!history.length) return;
  var h = history.pop();
  if (h.type === 'input') board[h.row][h.col] = h.prev;
  else if (h.type === 'pencil') { if (h.added) pencilMarks[h.row][h.col].delete(h.n); else pencilMarks[h.row][h.col].add(h.n); }
  render();
}

function getHint() {
  var empty = [];
  for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) { if (board[r][c] === 0) empty.push([r, c]); }
  if (!empty.length) return;
  var [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = solution[r][c];
  given[r][c] = true;
  selectedRow = r; selectedCol = c;
  render();
  checkWin();
}

function checkWin() {
  for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) { if (board[r][c] !== solution[r][c]) return; }
  clearInterval(timerInterval);
  var m = Math.floor(seconds/60), s = seconds%60;
  document.getElementById('winMsg').textContent = `难度: ${difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}  用时: ${m}:${String(s).padStart(2,'0')}  错误: ${errors}`;
  document.getElementById('overlay').style.display = 'flex';
}

function closeOverlay() { document.getElementById('overlay').style.display = 'none'; }

document.addEventListener('keydown', e => {
  if (e.key >= '1' && e.key <= '9') { e.preventDefault(); inputNum(parseInt(e.key)); }
  if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); eraseCell(); }
  if (e.key === 'p') { e.preventDefault(); togglePencil(); }
  if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undoMove(); }
  var arrowMap = {ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
  if (arrowMap[e.key] && selectedRow >= 0) {
    e.preventDefault();
    selectedRow = Math.max(0, Math.min(8, selectedRow + arrowMap[e.key][0]));
    selectedCol = Math.max(0, Math.min(8, selectedCol + arrowMap[e.key][1]));
    render();
  }
});

newGame('easy');