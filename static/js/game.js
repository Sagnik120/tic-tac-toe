document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const messageElement = document.getElementById('message');
  const resetButton = document.getElementById('reset-btn');

  let board = Array(9).fill('');
  let gameOver = false;

  initBoard();

  function initBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, index) => {
      const cellDiv = document.createElement('div');
      cellDiv.classList.add('cell');
      cellDiv.dataset.index = index;
      cellDiv.addEventListener('click', handleCellClick);
      boardElement.appendChild(cellDiv);
    });
  }

  function handleCellClick(e) {
    if (gameOver) return;

    const index = e.target.dataset.index;

    if (board[index] === '') {
      board[index] = 'X';
      renderBoard();

      checkGameOver();

      if (!gameOver) {
        setTimeout(() => {
          sendMoveToBackend();
        }, 300);
      }
    }
  }

  function sendMoveToBackend() {
    fetch('/api/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        board: board,
        level: level
      })
    })
    .then(response => response.json())
    .then(data => {
      board = data.board;
      renderBoard();

      if (data.winner) {
        showMessage(data.winner);
        gameOver = true;
        resetButton.style.display = 'inline-block';
      }
    });
  }

  function renderBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
      const i = cell.dataset.index;
      cell.textContent = board[i];
      cell.classList.add('fade-in');
    });
  }

  function checkGameOver() {
    const winner = checkWinnerJS(board);
    if (winner) {
      showMessage(winner);
      gameOver = true;
      resetButton.style.display = 'inline-block';
    }
  }

  function checkWinnerJS(b) {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    for (let combo of wins) {
      if (b[combo[0]] && b[combo[0]] === b[combo[1]] && b[combo[1]] === b[combo[2]]) {
        return b[combo[0]];
      }
    }

    if (!b.includes('')) {
      return 'Draw';
    }

    return null;
  }

  function showMessage(winner) {
    if (winner === 'Draw') {
      messageElement.textContent = "It's a draw!";
    } else {
      messageElement.textContent = `${winner} wins!`;
    }
  }

  resetButton.addEventListener('click', () => {
    board = Array(9).fill('');
    gameOver = false;
    messageElement.textContent = '';
    resetButton.style.display = 'none';
    initBoard();
  });
});
