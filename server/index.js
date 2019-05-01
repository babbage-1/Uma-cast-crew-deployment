require('newrelic');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require ('cors');
const db = require('../database/PGindex');
const port = process.env.PORT || 2002;
app.use(cors());

app.use('/:id', express.static(__dirname + '/../client/dist'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/actors/:id', async (req, res) => {
  let movieId = Number(req.params.id);
  try{
  const movieGetReq = await db.getActorById(movieId);
    res.status(200).send(movieGetReq);
  } catch(e){
    if (Error.Message === 'Error Inside DB Get') {
      res.statusCode(500);
    }
  }
});

app.post('/actors/add', async (req, res) => {
  try {
    const {name, title, role, photo, bio, filmography, movieId} = req.body;
    console.log(name, title, role, photo, bio, filmography, movieId);
    const rowId = await db.createActor(name, title, role, photo, bio, filmography, movieId);
    res.status(201).send(`User added with row id: ${rowId}`);
  } catch (e) {
    if (Error.Message === 'Error Inside DB Post') {
      res.statusCode(500);
    }

  }
});

app.put('/actors/update', (req, res) => {
  const {name, title, role, photo, bio, filmography, id} = req.body;
  console.log(req.params.id);
  console.log('PUT', name, title, role, photo, bio, filmography, id);
  db.updateActor(name, title, role, photo, bio, filmography, id, (err, results) => {
    if (err) {
      res.sendStatus(500);
      console.log(`actors PUT error=${err}`);
    }
    res.send(`User updated for ID: ${id}`);
  });
});

app.delete('/actors/delete', (req, res) => {
  const {id} = req.body;
  console.log(id);
  db.deleteActor(id, (err, results) => {
    if (err) {
      res.sendStatus(500);
      console.log(`actors DELETE error=${err}`);
    }
    res.send(`User deleted for ID: ${id}`);
  });
});


app.listen(port, () => {
  console.log(`listening on port ${port}!`);
});










