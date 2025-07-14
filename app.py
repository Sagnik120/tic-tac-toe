from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Constants
PLAYER = 'X'
AI = 'O'
EMPTY = ''


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/game/<level>')
def game(level):
    return render_template('game.html', level=level)


@app.route('/api/move', methods=['POST'])
def api_move():
    data = request.json
    board = data['board']
    level = data['level']

    if level == 'hard':
        best_move_index = find_best_move(board)
    elif level == 'medium':
        # 50% chance best move, 50% random
        if random.random() < 0.5:
            best_move_index = find_best_move(board)
        else:
            best_move_index = find_random_move(board)
    else:
        best_move_index = find_random_move(board)

    board[best_move_index] = AI

    winner = check_winner(board)

    response = {
        'board': board,
        'winner': winner
    }

    return jsonify(response)


def find_random_move(board):
    empty_indices = [i for i, cell in enumerate(board) if cell == EMPTY]
    return random.choice(empty_indices)


def find_best_move(board):
    # AI plays with Minimax
    best_score = -float('inf')
    best_move = None

    for i in range(9):
        if board[i] == EMPTY:
            board[i] = AI
            score = minimax(board, False)
            board[i] = EMPTY

            if score > best_score:
                best_score = score
                best_move = i

    return best_move


def minimax(board, is_maximizing):
    winner = check_winner(board)

    if winner == AI:
        return 1
    elif winner == PLAYER:
        return -1
    elif EMPTY not in board:
        return 0

    if is_maximizing:
        best_score = -float('inf')
        for i in range(9):
            if board[i] == EMPTY:
                board[i] = AI
                score = minimax(board, False)
                board[i] = EMPTY
                best_score = max(score, best_score)
        return best_score

    else:
        best_score = float('inf')
        for i in range(9):
            if board[i] == EMPTY:
                board[i] = PLAYER
                score = minimax(board, True)
                board[i] = EMPTY
                best_score = min(score, best_score)
        return best_score


def check_winner(board):
    win_combos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]

    for combo in win_combos:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] != EMPTY:
            return board[combo[0]]

    if EMPTY not in board:
        return 'Draw'

    return None


if __name__ == '__main__':
    app.run(debug=True)
