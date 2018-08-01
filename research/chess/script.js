var board, game = new Chess();
var chess_ai_1;
board = ChessBoard('board', 'start');

/* Rendering, buttons and env */
var renderMoveHistory = function (moves) {
    var historyElement = $('#move-history').empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + ' ' + ( moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);

};

/*AI part */



var makeRandomMove = function() {
    var possibleMoves = game.moves();
    
    // exit if the game is over
    if (game.game_over() === true || game.in_draw() === true ||
        possibleMoves.length === 0) return;
    
    var randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    board.position(game.fen());
    window.setTimeout(chess_ai_1, 100);
    renderMoveHistory(game.history());
};



// button functions
var reset = function(){
    board,game = new Chess();
}

var start = function(){
    
    var ai1_selection = document.getElementById("chess_ai_1").value;
    var ai2_selection = document.getElementById("chess_ai_2").value;
    
    if (ai1_selection == "rand")
        chess_ai_1 = makeRandomMove;
    
    
    if (ai2_selection == "rand")
        chess_ai_2 = makeRandomMove;

    window.setTimeout(chess_ai_1, 100);
}

