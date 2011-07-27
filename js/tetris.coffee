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

document.onready = (event) ->
    canvas = document.getElementById('game-area')
    canvas.click #add focus
    ctx = canvas?.getContext('2d')
    return alert 'Your browser is too old to play this game' if not ctx

    next_element = document.getElementById('next-element')
    next_ctx = next_element.getContext('2d')

    L_PIECE = [[0, -1], [0, 0], [0, 1], [1, 1]]
    I_PIECE = [[0, -2], [0, -1], [0, 0], [0, 1], [0, 2]]
    O_PIECE = [[-1, 0], [0, 0], [0, -1], [-1, -1]]
    S_PIECE = [[-1, 0], [0, 0], [0, 1], [1, 1]]

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
        game.next_piece = one_of(L_PIECE, mirror(L_PIECE), I_PIECE, O_PIECE, S_PIECE, mirror(S_PIECE))
        game.color = game.next_color
        game.next_color = one_of("red", "green", "blue", "black", "orange", "yellow")
        if game.piece then draw_next() else add_new_piece()

    draw_next = ->
        next_ctx.fillStyle = "white"
        next_ctx.fillRect 0, 0, next_element.width, next_element.height
        next_ctx.fillStyle = game.next_color
        next_ctx.fillRect(BSZ * (x + 2), next_element.height - BSZ * (y + 4), BSZ, BSZ) for [x, y] in game.next_piece

    title_bar = document.getElementById('title-bar')
    score_span = document.getElementById('score')

    game_tick = ->
        draw_everything()
        if collides(game.piece, game.x, game.y - 1)
            for [dx, dy] in game.piece when 0 <= game.y + dy < HEIGHT
                    game.board[game.y+dy][game.x+dx] = game.color
            needs_redraw = false
            for y in [0...HEIGHT]
                ry = HEIGHT - y - 1
                if game.board[ry].length == WIDTH and all(game.board[ry])
                    needs_redraw = true
                    game.board[ry..ry] = []
                    game.board.push []
                    ++score_span.innerHTML
            if needs_redraw
                draw_everything()
            add_new_piece()
            if collides(game.piece, game.x, game.y)
                game_lost()
        else
            --game.y

    game_lost = ->
        clearInterval(gti)
        title_bar.innerHTML = "you earned " + score_span.innerHTML + " points, looser!"

    document.onkeydown = (event) ->
        switch event?.keyCode
            # left arrow
            when 37 then --game.x if all(game.x + dx > 0 for [dx, _] in game.piece) and not collides(game.piece, game.x - 1, game.y)

            # right arrow
            when 39 then ++game.x if all(game.x + dx < WIDTH - 1 for [dx, _] in game.piece) and not collides(game.piece, game.x + 1, game.y)

            # down arrow
            when 40 then --game.y unless collides(game.piece, game.x, game.y - 1) 

            # enter key
            when 13 then new_piece = turn_right(game.piece); game.piece = new_piece if in_board(new_piece, game.x, game.y) and not collides(new_piece, game.x, game.y)
            
            # up arrow or spacebar
            when 38, 32 then new_piece = turn_left(game.piece); game.piece = new_piece if in_board(new_piece, game.x, game.y) and not collides(new_piece, game.x, game.y)
            else
                console.debug event

    add_new_piece()
    draw_everything()
    gti = setInterval(game_tick, 200)

    true
