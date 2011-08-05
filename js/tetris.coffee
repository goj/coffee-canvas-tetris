# TODO: learn more about JS prototype-based OO

# stdlib
any = (collection) ->
    (return true) for elem in collection when elem
    return false
all = (collection) ->
    (return false) for elem in collection when not elem
    return true
one_of = (collection...) ->
    collection[Math.floor(Math.random() * collection.length)]

# calculates score based on lines and level
score = (level, lines) ->
    # from http://tetris.wikia.com/wiki/Scoring
    switch lines
        when 1 then 40 * (level + 1)
        when 2 then 100 * (level + 1)
        when 3 then 300 * (level + 1)
        when 4 then 1200 * (level + 1)

document.onready = (event) ->
    canvas = document.getElementById('game-area')
    ctx = canvas?.getContext('2d')
    return alert 'Your browser is too old to play this game' if not ctx
    gti = null # gti tracks the "Game Tick Interval"
    speed = 500

    lines_cleared = 0 # tracks lines cleared total

    # tracks current level
    level = 0

    # lines needed for next level up
    next_level = 5
    
    next_element = document.getElementById('next-element')
    next_ctx = next_element.getContext('2d')

    down_wasnt_pushed = true

    # for in game text
    game_text = null
    ctx.textAlign = "center"
    ctx.font = "20pt Courier New"
    text_color = "black"

    L_PIECE = [[0, -1], [0, 0], [0, 1], [1, 1]]
    I_PIECE = [[0, -1], [0, 0], [0, 1], [0, 2]]
    O_PIECE = [[-1, 0], [0, 0], [0, -1], [-1, -1]]
    S_PIECE = [[-1, 0], [0, 0], [0, 1], [1, 1]]
    T_PIECE = [[-1, 0], [0, 0], [0, 1], [1, 0]]

    BSZ = 20 # block size
    WIDTH = canvas.width / BSZ
    HEIGHT = canvas.height / BSZ
    draw_block = (x, y) ->
        ctx.fillRect(BSZ * x, BSZ * (HEIGHT - y - 1), BSZ, BSZ)

    draw_piece = (shape, x, y) ->
        draw_block x+dx, y+dy for [dx, dy] in shape
        undefined

    mirror     = (shape) -> [-x, y] for [x, y] in shape
    turn_right = (shape) -> [y, -x] for [x, y] in shape
    turn_left  = (shape) -> [-y, x] for [x, y] in shape

    game =
        board: [] for _ in [0..HEIGHT]

    collides = (shape, x, y) ->
        any(y+dy < 0 or game.board[y+dy][x+dx] for [dx, dy] in shape)

    in_board = (shape, x, y) ->
        all(0 <= x + dx < WIDTH for [dx, dy] in shape)

    draw_everything = ->
        ctx.fillStyle = "white"
        ctx.fillRect 0, 0, canvas.width, canvas.height
        for y in [0...HEIGHT]
            for x in [0...WIDTH] when color = game.board[y][x]
                ctx.fillStyle = color
                draw_block x, y
        ctx.fillStyle = game.color
        draw_piece game.piece, game.x, game.y

    add_new_piece = ->
        game.x = WIDTH / 2
        game.y = HEIGHT - 3
        game.piece = game.next_piece
        game.next_piece = one_of(L_PIECE, mirror(L_PIECE), I_PIECE, O_PIECE, S_PIECE, mirror(S_PIECE), T_PIECE)
        game.color = game.next_color
        game.next_color = one_of("red", "green", "blue", "black", "orange", "yellow")
        if game.piece then draw_next() else add_new_piece()

    draw_next = ->
        next_ctx.fillStyle = "white"
        next_ctx.fillRect 0, 0, next_element.width, next_element.height
        next_ctx.fillStyle = game.next_color
        next_ctx.fillRect(BSZ * (x + 2), next_element.height - BSZ * (y + 4), BSZ, BSZ) for [x, y] in game.next_piece

    $score_span = $('#score')
    $level_span = $('#level')
    $lines_span = $('#lines')

    game_tick = ->
        if collides(game.piece, game.x, game.y - 1)
            for [dx, dy] in game.piece when 0 <= game.y + dy < HEIGHT
                    game.board[game.y+dy][game.x+dx] = game.color

            needs_redraw = false
            lines = 0
            for y in [0...HEIGHT]
                ry = HEIGHT - y - 1
                if game.board[ry].length == WIDTH and all(game.board[ry])
                    needs_redraw = true
                    game.board[ry..ry] = []
                    game.board.push []
                    lines++
            lines_cleared += lines
            $lines_span.text(lines_cleared)

            # increment score if lines were made
            $score_span.text(parseInt($score_span.text()) + score(level, lines)) if lines > 0

            if lines_cleared >= next_level
                level++
                $level_span.text(level)
                next_level += 5
                stop()
                start(speed - (speed/5))
                

            add_new_piece()

            if needs_redraw
                draw_everything()
            
            if collides(game.piece, game.x, game.y)
                game_lost()
        else if down_wasnt_pushed
            --game.y
            draw_everything()
        else
            down_wasnt_pushed = true

    start = (speed = 500)->
        if(gti == null)
            gti = setInterval(game_tick, speed)
            true
        else
            false

    stop = ->
        clearInterval(gti)
        gti = null
        true

    pause_or_unpause = ->
        if gti == null
            game_text = ctx.fillText("", 100, 100);
            start()
        else
            ctx.fillStyle = text_color
            game_text = ctx.fillText("PAUSED", 100, 100);
            stop()

    game_lost = ->
        ctx.fillStyle = text_color
        game_text = ctx.fillText("GAME OVER", 100, 100);
        stop()
        $(canvas).one "click", -> restart()

    restart = ->
        $score_span.text(0)
        $lines_span.text(0)
        $level_span.text(0)
        lines_cleared = 0
        level = 0
        next_level = 5
        game =
            board: [] for _ in [0..HEIGHT]
        add_new_piece()
        draw_everything()
        start()

    document.onkeydown = (event) ->
        # don't allow movement when game is not ticking
        if gti == null
            return false

        switch event?.keyCode
            # left arrow
            when 37 then --game.x if all(game.x + dx > 0 for [dx, _] in game.piece) and not collides(game.piece, game.x - 1, game.y)

            # right arrow
            when 39 then ++game.x if all(game.x + dx < WIDTH - 1 for [dx, _] in game.piece) and not collides(game.piece, game.x + 1, game.y)

            # down arrow
            when 40 
                --game.y unless collides(game.piece, game.x, game.y - 1) 
                down_wasnt_pushed = false

            # enter key
            when 13 then new_piece = turn_right(game.piece); game.piece = new_piece if in_board(new_piece, game.x, game.y) and not collides(new_piece, game.x, game.y)
            
            # up arrow or spacebar
            when 38, 32 then new_piece = turn_left(game.piece); game.piece = new_piece if in_board(new_piece, game.x, game.y) and not collides(new_piece, game.x, game.y)
            else
                console.debug event
        draw_everything()

    # start and stop event bindings
    $(canvas).click -> pause_or_unpause()

    # start the game
    restart()

    true
