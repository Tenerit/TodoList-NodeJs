#!/usr/bin/env node
//Florian Borie et Anthony Scotto d'Aniello

const db = require('sqlite')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

//ecoute sur le port 1211
const PORT = process.env.PORT || 1211;

//appel le dossier des views
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

//création de la bdd et vérification si elle y es pas pour pas la créer plusieurs fois
db.open('sample.db').then(() => {
  Promise.all([
    db.run("CREATE TABLE IF NOT EXISTS todos (name, completion, updatedAt, createdAt, userId)"),
    db.run("CREATE TABLE IF NOT EXISTS users (firstname, lastname, username, password, email, createdAt, updatedAt)"),
  ]).then(() => {
    console.log('Databases are ready')
  }).catch((err) => {
    console.log('Une erreur est survenue :', err)
  })
})

//convertir les requetes en json
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Methode overide
app.use(methodOverride('_method'))

// ROUTES
app.use('/todos', require('./controllers/todos.js'))
app.use('/users', require('./controllers/users.js'))

app.all('/', (req, res, next) => {
  res.redirect(301, '/todos')
})
app.get('*', (req, res, next) => {
  res.redirect(301, '/todos')
})

//écoute sur le port 1211
app.listen(PORT, () =>{

  console.log('Serveur sur port : ', PORT)

});