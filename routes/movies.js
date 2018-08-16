const express = require('express');
const authMiddleware = require('../middleware/auth');
const { Movie } = require('../models');

var router = express.Router();

router.use(authMiddleware);

//Retorna todos os filmes que a locadora possui
router.get('/', async (req, res) => {
  try {

    const movies = await Movie.all();

    res.send({ movies }).status(200);
  } catch (err) {
    res.send({ error: 'Error searching movies' });
  }
});

//Retorna todos os filmes DISPONIVEIS que a locadora possui
router.get('/available', async (req, res) => {
  try {

    const movies = await Movie.findAll({
      where: {
        available: 'true'
      }
    });

    if (!movies.length)
      return res.send({ message: 'No movies available' });

    res.send({ movies }).status(200);
  } catch (err) {
    res.send({ error: 'Error searching movies' });
  }
});

//Pesquisa por um filme utilizando ID
router.get('/:movieId', async (req, res) => {
  try {

    const movie = await Movie.findById(req.params.movieId);

    if (!movie)
      res.send({ message: 'Movie not exist' });

    res.send({ movie }).status(200);
  } catch (err) {
    res.send({ error: 'Error search movie' });
  }
});

//Pesquisa por um filme por title
router.get('/title/:movieTitle', async (req, res) => {
  try {

    const movie = await Movie.findAll({
      where: {
        title: {
          $like: '%' + req.params.movieTitle + '%'
        },
      }
    });


    if (!movie.length)
      res.send({ message: 'Movie not exist' });

    res.send({ movie }).status(200);
  } catch (err) {
    res.send({ error: 'Error creating new movie' });
  }
});

//Aluga um filme
router.post('/rent/:movieId', async (req, res) => {
  try {

    const movie = await Movie.findById(req.params.movieId);

    if (!movie)
      res.send({ message: 'Movie not exist' });


    if (!movie.available)
      return res.send({ message: 'Movie not available' });

    movie.available = true;
    movie.userId = req.userId;
    await movie.save();

    res.send({ movie }).status(200);

  } catch (err) {
    res.send({ error: 'Error creating new movie' });
  }
});
//Devolve um filme
router.post('/return/:movieId', async (req, res) => {
  try {

    const movie = await Movie.findById(req.params.movieId);

    if (!movie)
      res.send({ message: 'Movie not exist' });


    if (movie.userId !== req.userId)
      return res.send({ message: 'Movie does not belong to you' });

    movie.available = true;
    movie.userId = null;
    await movie.save();

    res.send({ movie }).status(200);

  } catch (err) {
    res.send({ error: 'Error creating new movie' });
  }
});
module.exports = router;
