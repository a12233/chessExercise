const insertGame = (request, response) => {
    const { id, moves, color } = request.body
  
    pool.query('INSERT INTO games (id, moves, color) VALUES ($1, $2, $3)', [id, moves, color], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`User added with ID: ${result.insertId}`)
    })
  }

  //1. e4 e5 2. Nf3 Nc6 3. Nc3 Bc5 4. Nxe5 Nxe5 5. d4 Nd3+ 6. Qxd3 Bb4 7. a3 Bxc3+ 8. Qxc3 Nf6 9. Bd3 O-O 10. O-O d6 11. Bg5 Qe8 12. Bxf6 gxf6 13. Rae1 Qd7 14. d5 Re8 15. Qxf6 Qg4 16. Re3 b6 17. Rg3 c5 18. Rxg4+ Bxg4 19. f3 Bh5 20. g4 Bg6 21. Qxd6 Rad8 22. Qg3 Rb8 23. e5 c4 24. Bxg6 fxg6 25. c3 Red8 26. Rd1 b5 27. f4 Rdc8 28. Qh4 b4 29. axb4 Ra8 30. f5 gxf5 31. gxf5 Kh8 32. f6 a5 33. Qg4 Rg8 34. Qxg8+ Rxg8+ 35. Kh1 Rg5 36. f7 Rxe5 37. f8=Q# 1-0

  //NrVVrQqj

  //white

  module.exports = {
    insertGame
  }