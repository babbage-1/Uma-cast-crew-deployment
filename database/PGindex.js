const { Pool} = require('pg');
const { config } = require('./config');

const pool = new Pool({
  user: config.user,
  host:  config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});

//Postres query SELECT * from ActorInfo INNER JOIN MovieInfo ON movieinfo.ACTORID=actorInfo.ID WHERE movieinfo.movieid=movieid;

const getActorById = async (id) => {
  const getQuery = {
    name: 'read-ActorInfo-for-Movie',
    text: 'SELECT * from ActorInfo INNER JOIN MovieInfo ON movieinfo.ACTORID=actorInfo.ID WHERE movieinfo.movieid=$1',
    values: [id],
  }
  try {
    const res = await pool.query(getQuery);
    return res.rows;
  } catch (e) {
    console.log(e.stack);
    throw e;
  }
};

const createActor = async(name, title, role, photo, bio, filmography, movieId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('inside function');
    const firstQuery = await client.query('INSERT INTO actorInfo (name, title, role, photo, bio, filmography) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [name, title, role, photo, bio, filmography]);
    console.log('1st query executed');
    const data = firstQuery.rows[0].id;
    const secondQuery = await client.query('INSERT INTO movieInfo(movieId, actorid) VALUES($1,$2) RETURNING id', [movieId, data]);
    await client.query('COMMIT');
    return secondQuery.rows[0].id;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const updateActor = (name, title, role, photo, bio, filmography, id, callback) => {
  pool.query('UPDATE actorInfo SET name= $1, title=$2, role=$3, photo=$4, bio=$5, filmography=$6 WHERE id=$7', [name, title, role, photo, bio, filmography, id], (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const deleteActor = (id, callback) => {
  pool.query('DELETE FROM actorInfo WHERE id=$1', [id], (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getActorById,
  createActor,
  updateActor,
  deleteActor
};