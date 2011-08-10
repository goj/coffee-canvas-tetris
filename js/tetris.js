(function() {
  var all, any, one_of, score;
  var __slice = Array.prototype.slice;
  any = function(collection) {
    var elem, _i, _len;
    for (_i = 0, _len = collection.length; _i < _len; _i++) {
      elem = collection[_i];
      if (elem) {
        return true;
      }
    }
    return false;
  };
  all = function(collection) {
    var elem, _i, _len;
    for (_i = 0, _len = collection.length; _i < _len; _i++) {
      elem = collection[_i];
      if (!elem) {
        return false;
      }
    }
    return true;
  };
  one_of = function() {
    var collection;
    collection = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return collection[Math.floor(Math.random() * collection.length)];
  };
  score = function(level, lines) {
    switch (lines) {
      case 1:
        return 40 * (level + 1);
      case 2:
        return 100 * (level + 1);
      case 3:
        return 300 * (level + 1);
      case 4:
        return 1200 * (level + 1);
    }
  };
  document.onready = function(event) {
    var $level_span, $lines_span, $score_span, BSZ, HEIGHT, I_PIECE, L_PIECE, O_PIECE, S_PIECE, T_PIECE, WIDTH, add_new_piece, canvas, collides, ctx, down_wasnt_pushed, draw_block, draw_everything, draw_next, draw_piece, game, game_lost, game_text, game_tick, gti, in_board, level, lines_cleared, mirror, next_ctx, next_element, next_level, pause_or_unpause, restart, speed, start, stop, text_color, turn_left, turn_right, _;
    canvas = document.getElementById('game-area');
    ctx = canvas != null ? canvas.getContext('2d') : void 0;
    if (!ctx) {
      return alert('Your browser is too old to play this game');
    }
    gti = null;
    speed = 500;
    lines_cleared = 0;
    level = 0;
    next_level = 5;
    next_element = document.getElementById('next-element');
    next_ctx = next_element.getContext('2d');
    down_wasnt_pushed = true;
    game_text = null;
    ctx.textAlign = "center";
    ctx.font = "20pt Courier New";
    text_color = "black";
    L_PIECE = [[0, -1], [0, 0], [0, 1], [1, 1]];
    I_PIECE = [[0, -1], [0, 0], [0, 1], [0, 2]];
    O_PIECE = [[-1, 0], [0, 0], [0, -1], [-1, -1]];
    S_PIECE = [[-1, 0], [0, 0], [0, 1], [1, 1]];
    T_PIECE = [[-1, 0], [0, 0], [0, 1], [1, 0]];
    BSZ = 20;
    WIDTH = canvas.width / BSZ;
    HEIGHT = canvas.height / BSZ;
    draw_block = function(x, y) {
      return ctx.fillRect(BSZ * x, BSZ * (HEIGHT - y - 1), BSZ, BSZ);
    };
    draw_piece = function(shape, x, y) {
      var dx, dy, _i, _len, _ref;
      for (_i = 0, _len = shape.length; _i < _len; _i++) {
        _ref = shape[_i], dx = _ref[0], dy = _ref[1];
        draw_block(x + dx, y + dy);
      }
      return;
    };
    mirror = function(shape) {
      var x, y, _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = shape.length; _i < _len; _i++) {
        _ref = shape[_i], x = _ref[0], y = _ref[1];
        _results.push([-x, y]);
      }
      return _results;
    };
    turn_right = function(shape) {
      var x, y, _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = shape.length; _i < _len; _i++) {
        _ref = shape[_i], x = _ref[0], y = _ref[1];
        _results.push([y, -x]);
      }
      return _results;
    };
    turn_left = function(shape) {
      if(game.piece != O_PIECE)
	 {
		var x, y, _i, _len, _ref, _results;
		_results = [];
		for (_i = 0, _len = shape.length; _i < _len; _i++) {
		_ref = shape[_i], x = _ref[0], y = _ref[1];
		_results.push([-y, x]);
		}
      	 
      return _results;
	 }
    };
    game = {
      board: (function() {
        var _results;
        _results = [];
        for (_ = 0; 0 <= HEIGHT ? _ <= HEIGHT : _ >= HEIGHT; 0 <= HEIGHT ? _++ : _--) {
          _results.push([]);
        }
        return _results;
      })()
    };
    collides = function(shape, x, y) {
      var dx, dy;
      return any((function() {
        var _i, _len, _ref, _results;
        _results = [];
        for (_i = 0, _len = shape.length; _i < _len; _i++) {
          _ref = shape[_i], dx = _ref[0], dy = _ref[1];
          _results.push(y + dy < 0 || game.board[y + dy][x + dx]);
        }
        return _results;
      })());
    };
    in_board = function(shape, x, y) {
      var dx, dy;
      return all((function() {
        var _i, _len, _ref, _ref2, _results;
        _results = [];
        for (_i = 0, _len = shape.length; _i < _len; _i++) {
          _ref = shape[_i], dx = _ref[0], dy = _ref[1];
          _results.push((0 <= (_ref2 = x + dx) && _ref2 < WIDTH));
        }
        return _results;
      })());
    };
    draw_everything = function() {
      var color, x, y;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (y = 0; 0 <= HEIGHT ? y < HEIGHT : y > HEIGHT; 0 <= HEIGHT ? y++ : y--) {
        for (x = 0; 0 <= WIDTH ? x < WIDTH : x > WIDTH; 0 <= WIDTH ? x++ : x--) {
          if (color = game.board[y][x]) {
            ctx.fillStyle = color;
            draw_block(x, y);
          }
        }
      }
      ctx.fillStyle = game.color;
      return draw_piece(game.piece, game.x, game.y);
    };
    add_new_piece = function() {
      game.x = WIDTH / 2;
      game.y = HEIGHT - 3;
      game.piece = game.next_piece;
      game.next_piece = one_of(L_PIECE, mirror(L_PIECE), I_PIECE, O_PIECE, S_PIECE, mirror(S_PIECE), T_PIECE);
      game.color = game.next_color;
      game.next_color = one_of("red", "green", "blue", "black", "orange", "yellow");
      if (game.piece) {
        return draw_next();
      } else {
        return add_new_piece();
      }
    };
    draw_next = function() {
      var x, y, _i, _len, _ref, _ref2, _results;
      next_ctx.fillStyle = "white";
      next_ctx.fillRect(0, 0, next_element.width, next_element.height);
      next_ctx.fillStyle = game.next_color;
      _ref = game.next_piece;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref2 = _ref[_i], x = _ref2[0], y = _ref2[1];
        _results.push(next_ctx.fillRect(BSZ * (x + 2), next_element.height - BSZ * (y + 4), BSZ, BSZ));
      }
      return _results;
    };
    $score_span = $('#score');
    $level_span = $('#level');
    $lines_span = $('#lines');
    game_tick = function() {
      var dx, dy, lines, needs_redraw, ry, y, _i, _len, _ref, _ref2, _ref3, _ref4;
      if (collides(game.piece, game.x, game.y - 1)) {
        _ref = game.piece;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref2 = _ref[_i], dx = _ref2[0], dy = _ref2[1];
          if ((0 <= (_ref3 = game.y + dy) && _ref3 < HEIGHT)) {
            game.board[game.y + dy][game.x + dx] = game.color;
          }
        }
        needs_redraw = false;
        lines = 0;
        for (y = 0; 0 <= HEIGHT ? y < HEIGHT : y > HEIGHT; 0 <= HEIGHT ? y++ : y--) {
          ry = HEIGHT - y - 1;
          if (game.board[ry].length === WIDTH && all(game.board[ry])) {
            needs_redraw = true;
            [].splice.apply(game.board, [ry, ry - ry + 1].concat(_ref4 = [])), _ref4;
            game.board.push([]);
            lines++;
          }
        }
        lines_cleared += lines;
        $lines_span.text(lines_cleared);
        if (lines > 0) {
          $score_span.text(parseInt($score_span.text()) + score(level, lines));
        }
        if (lines_cleared >= next_level) {
          level++;
          $level_span.text(level);
          next_level += 5;
          stop();
          start(speed - (speed / 5));
        }
        add_new_piece();
        if (needs_redraw) {
          draw_everything();
        }
        if (collides(game.piece, game.x, game.y)) {
          return game_lost();
        }
      } else if (down_wasnt_pushed) {
        --game.y;
        return draw_everything();
      } else {
        return down_wasnt_pushed = true;
      }
    };
    start = function(speed) {
      if (speed == null) {
        speed = 500;
      }
      if (gti === null) {
        gti = setInterval(game_tick, speed);
        return true;
      } else {
        return false;
      }
    };
    stop = function() {
      clearInterval(gti);
      gti = null;
      return true;
    };
    pause_or_unpause = function() {
      if (gti === null) {
        game_text = ctx.fillText("", 100, 100);
        return start();
      } else {
        ctx.fillStyle = text_color;
        game_text = ctx.fillText("PAUSED", 100, 100);
        return stop();
      }
    };
    game_lost = function() {
      ctx.fillStyle = text_color;
      game_text = ctx.fillText("GAME OVER", 100, 100);
      stop();
      return $(canvas).one("click", function() {
        return restart();
      });
    };
    restart = function() {
      var _;
      $score_span.text(0);
      $lines_span.text(0);
      $level_span.text(0);
      lines_cleared = 0;
      level = 0;
      next_level = 5;
      game = {
        board: (function() {
          var _results;
          _results = [];
          for (_ = 0; 0 <= HEIGHT ? _ <= HEIGHT : _ >= HEIGHT; 0 <= HEIGHT ? _++ : _--) {
            _results.push([]);
          }
          return _results;
        })()
      };
      add_new_piece();
      draw_everything();
      return start();
    };
    document.onkeydown = function(event) {
      var dx, new_piece;
      if (gti === null) {
        return false;
      }
      switch (event != null ? event.keyCode : void 0) {
        case 37:
          if (all((function() {
            var _i, _len, _ref, _ref2, _results;
            _ref = game.piece;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              _ref2 = _ref[_i], dx = _ref2[0], _ = _ref2[1];
              _results.push(game.x + dx > 0);
            }
            return _results;
          })()) && !collides(game.piece, game.x - 1, game.y)) {
            --game.x;
          }
          break;
        case 39:
          if (all((function() {
            var _i, _len, _ref, _ref2, _results;
            _ref = game.piece;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              _ref2 = _ref[_i], dx = _ref2[0], _ = _ref2[1];
              _results.push(game.x + dx < WIDTH - 1);
            }
            return _results;
          })()) && !collides(game.piece, game.x + 1, game.y)) {
            ++game.x;
          }
          break;
        case 40:
          if (!collides(game.piece, game.x, game.y - 1)) {
            --game.y;
          }
          down_wasnt_pushed = false;
          break;
        case 13:
          new_piece = turn_right(game.piece);
          if (in_board(new_piece, game.x, game.y) && !collides(new_piece, game.x, game.y)) {
            game.piece = new_piece;
          }
          break;
        case 38:
        case 32:
          new_piece = turn_left(game.piece);
          if (in_board(new_piece, game.x, game.y) && !collides(new_piece, game.x, game.y)) {
            game.piece = new_piece;
          }
          break;
        default:
          console.debug(event);
      }
      return draw_everything();
    };
    $(canvas).click(function() {
      return pause_or_unpause();
    });
    restart();
    return true;
  };
}).call(this);
