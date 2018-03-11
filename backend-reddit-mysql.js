'use strict';

var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var bcrypt = require('bcrypt');


var app = express();
app.use(bodyParser.json());
app.use(express.urlencoded());
app.use(cors());

let conn = connectionDataSetup();
connectToMySQL();

function connectionDataSetup() {
  let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'posts',
  });
  return conn
};
function connectToMySQL () {
  conn.connect((err) => {
    if(err){
      console.log("Error connecting to Database");
      return;
    }
    console.log("Connection established");
  });
};
function endConnection () {
  conn.end(function () {
    console.log('SQL Connection ended')
  });
};
function databaseError (err) {
  if(err) {
    console.log(err.toString());
    res.status(500).send('Database error');
    return;
  }
};

app.get('/posts', function(req, res) {
  conn.query('SELECT * FROM threads ORDER BY score DESC;',function(err, rows){
    databaseError();
    res.json({'posts': rows});
  });
});

app.post('/posts', function (req, res) {
  req.body.timestamp = Date.now() / 3600000;
  conn.query('INSERT INTO threads SET ?', req.body, (err, result) => {
    databaseError();   
    console.log('saved');
    res.send();
  });
});

app.delete('/posts/:id', function (req, res) {
  conn.query('DELETE FROM threads WHERE id = ?', [req.params.id], (err, result) => {
    databaseError();
    console.log('deleted');
    res.send();
  });
});

app.put('/posts/:id/upvote', function (req, res) {
  conn.query('UPDATE threads SET score = ? WHERE id = ?', [req.body.score, req.body.id], (err, result) => {
    databaseError();
    console.log('upvoted');
    res.send();
  });  
});

app.put('/posts/:id/downvote', function (req, res) {
  conn.query('UPDATE threads SET score = ? WHERE id = ?', [req.body.score, req.body.id], (err, result) => {
    databaseError();
    console.log('downvoted');
    res.send();
  });
});

app.post('/login/submit', function (req, res) {
  let hashed = bcrypt.hash(req.body.password, 10);
  console.log(hashed);
  hashed.then(function (result) {
    let body = {
      'username': req.body.username,
      'password': result,
      'email': req.body.email
    }
    conn.query('INSERT INTO users SET ?', body, (err, result) => {
      databaseError();   
      console.log('account saved');
      res.send();
    });
  });
});

app.post('/login/login', function(req, res) {
  conn.query('SELECT id, username, password, email FROM users WHERE username = ?', [req.body.username], function(err, usernames){
    databaseError();
    if(usernames.length === 0){
      console.log('Bad username or password');
      return;
    };
    let user = usernames[0];
    if(bcrypt.compareSync(req.body.password, user.password) === true) {
      console.log('Beleptel')
    }else {
      console.log('Nem leptel be')
    }
  });
});

app.listen(3000, function (){
  console.log('App is running');
});

