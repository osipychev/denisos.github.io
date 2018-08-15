var board, game = new Chess();
var chess_ai1, chess_ai2;
var gameStop = false;
board = ChessBoard('board', 'start');

//temp var-- need to fix later
var n_games=0, w_wins=0, b_wins=0;
var ai1_turn = true;
var nPosEval;

/* Rendering, buttons and env */
var renderMoveHistory = function (moves) {
    var historyElement = $('#history').empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + ' ' + ( moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);
};

var renderStatistics = function () {
    var statElement = $('#statistics');
    statElement.append('<span>' + n_games + ': ' + (w_wins/n_games).toFixed(2) + '/' + (b_wins/n_games).toFixed(2) + '</span><br>');
};

/*AI part */

// Alpha-Beta Search
var abetaRoot =function(game) {

  var depth = 3;
  var maximizing = true;
  var bestMove, bestValue = -1000;
  var moves = game.ugly_moves();
  var evalSide = game.turn();

  //timers for performance evaluation
  nPosEval = 0;
  var timerEval = new Date().getTime();

  for(var i = 0; i < moves.length; i++) {
      var move = moves[i];
      game.ugly_move(move);
      nPosEval++;
      var value = abeta(depth - 1, game, evalSide, -1000, 1000, !maximizing);
      game.undo();
      if (value > bestValue) {
          bestValue = value;
          bestMove = move;
      }
  }
  console.log('Perf: ',nPosEval,' pos in ', ((new Date().getTime() - timerEval)/nPosEval).toFixed(2), 'msec average.');
  return bestMove;
};

var abeta = function (depth, game, evalSide, alpha, beta, maximizing) {
  if (depth === 0) {
      return (evalSide ==='w') ? evaluateBoard(game.board()) : -evaluateBoard(game.board());
  }

    var moves = game.ugly_moves();

    if (maximizing) {
        var bestValue = -1000;
        for (var i = 0; i < moves.length; i++) {
            game.ugly_move(moves[i]);
            nPosEval++;
            bestValue = Math.max(bestValue, abeta(depth - 1, game, evalSide, alpha, beta, !maximizing));
            game.undo();
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) {
                return bestValue;
            }
        }
        return bestValue;
    } else {
        var bestValue = 1000;
        for (var i = 0; i < moves.length; i++) {
            game.ugly_move(moves[i]);
            nPosEval++;
            bestValue = Math.min(bestValue, abeta(depth - 1, game, evalSide, alpha, beta, !maximizing));
            game.undo();
            beta = Math.min(beta, bestValue);
            if (beta <= alpha) {
                return bestValue;
            }
        }
        return bestValue;
    }
};

// Minimax Search
var minimaxRoot = function (game) {

    var depth = 2;
    var maximizing = true;
    var bestMove, bestValue = -1000;
    var moves = game.ugly_moves();
    var evalSide = game.turn();

    //timers for performance evaluation
    nPosEval = 0;
    var timerEval = new Date().getTime();

    for(var i = 0; i < moves.length; i++) {
        var move = moves[i];
        game.ugly_move(move);
        nPosEval++;
        var value = minimax(depth - 1, game, evalSide, !maximizing);
        game.undo();
        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    }
    console.log('Perf: ',nPosEval,' pos in ', ((new Date().getTime() - timerEval)/nPosEval).toFixed(2), 'msec average.');

    return bestMove;
}

var minimax = function (depth, game, evalSide, maximizing) {
    if (depth === 0) {
        return (evalSide==='w') ? evaluateBoard(game.board()) : -evaluateBoard(game.board());
    }

    var moves = game.ugly_moves();

    if (maximizing) {
        var bestValue = -1000;
        for (var i = 0; i < moves.length; i++) {
          game.ugly_move(moves[i]);
          nPosEval++;
          bestValue = Math.max(bestValue, minimax(depth - 1, game, evalSide, !maximizing));
      game.undo();
            }
    }
    else {
        var bestValue = 1000;
        for (var i = 0; i < moves.length; i++) {
          game.ugly_move(moves[i]);
          nPosEval++;
          bestValue = Math.min(bestValue, minimax(depth - 1, game, evalSide, !maximizing));
      game.undo();
            }
    }

    return bestValue;
}

var singleMove = function (game) {

    var moves = game.ugly_moves();
    var bestMove, bestValue = -1000;

    for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        var newPosition = new Chess(game.fen());
        newPosition.ugly_move(move);

        var value = evaluateBoard(newPosition.board())
        // value is negative if black's turn
        value = (game.turn()==='w') ? value : -value;
        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    }
  return bestMove;
}

var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
        }
    }
    return totalEvaluation;
}

var getPieceValue = function (piece) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece) {
        if (piece.type === 'p') {
            return 10;
        } else if (piece.type === 'r') {
            return 50;
        } else if (piece.type === 'n') {
            return 30;
        } else if (piece.type === 'b') {
            return 30 ;
        } else if (piece.type === 'q') {
            return 90;
        } else if (piece.type === 'k') {
            return 900;
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece);
    return (piece.color === 'w') ? absoluteValue : -absoluteValue;
}

/* RANDOM POLICY */
var randomMove = function(game) {
    var possibleMoves = game.ugly_moves();
    var randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomIndex];
}

/* Make a step switching AIs turn by turn */
var makeMove = function() {

    // exit if the game is over and STAT
    if (game.game_over() === true || gameStop === true){
        console.log((game.in_draw()) ? ('A Draw!') : ('Loser: ', game.turn()));
        n_games++;
        if (!game.in_draw() && !gameStop) (game.turn() == game.BLACK) ? w_wins++ : b_wins++;
        renderStatistics();
        reset();
        return;
    }

    var move = (ai1_turn) ? chess_ai1(game) : chess_ai2(game);
    game.ugly_move(move);
    board.position(game.fen());
    ai1_turn = !ai1_turn;
    setTimeout(makeMove, 100);
    renderMoveHistory(game.history());
}

// button functions
var reset = function(){
    board,game = new Chess();
    gameStop = false;
}

var stop = function(){
    gameStop = true;
}

var start = function(){

    switch (document.getElementById("chess_ai_1").value){
        case "rand": chess_ai1 = randomMove; break;
        case "1step": chess_ai1 = singleMove; break;
        case "minmax": chess_ai1 = minimaxRoot; break;
        case "abeta": chess_ai1 = abetaRoot; break;
    }

    switch (document.getElementById("chess_ai_2").value){
        case "rand": chess_ai2 = randomMove; break;
        case "1step": chess_ai2 = singleMove; break;
        case "minmax": chess_ai2 = minimaxRoot; break;
        case "abeta": chess_ai2 = abetaRoot; break;
    }

    reset();
    makeMove();
}
