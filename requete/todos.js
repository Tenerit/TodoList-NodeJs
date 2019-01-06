const router = require('express')();
//const router = require('express').Router();
const Todos = require('./../sql/todos');
const Users = require('./../sql/users');
const _ = require('lodash');


//affiche les toutes les données de la base
router.get('/', (req, res, next) => {

Todos.getAll()
  .then((rows) =>
  {

    res.format({
      html: () => {
        let contenue = '<table class="table"><tr><th>ID</th><th>Description</th><th>Completion</th><th>createdAt</th><th>updatedAt</th><th>userID</th></tr>'
        
        rows.forEach((row) => {
          contenue += '<tr>'
          contenue += '<td>' + row['id'] + '</td>'
          contenue += '<td>' + row['name'] + '</td>'
          contenue += '<td>' + row['completion'] + '</td>'
          contenue += '<td>' + row['createdAt'] + '</td>'
          contenue += '<td>' + row['updatedAt'] + '</td>'
          contenue += '<td>' + row['userId'] + '</td>'
          contenue += '<td> <form action="/todos/'+row['id']+'/edit/?_method=GET", method="GET"> <button type="submit" class="btn btn-primary">Modifier</button> </form> </td>'
          contenue += '<td> <form action="/todos/'+row['id']+'/?_method=GET", method="GET"> <button type="submit" class="btn btn-success">Afficher</button> </form> </td>'
          contenue += '<td> <form action="/todos/'+row['id']+'/?_method=DELETE", method="POST"> <button type="submit" class="btn btn-danger">Supprimer</button> </form> </td>'
          contenue += '</tr>'
        })
        
        contenue += '</table>'

        res.render("index", {  
            title: 'Todolist',
            content: contenue
        })
      },
      json: () => {
          res.json(todos)
      }
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})


//affiche toutes les données de la base selon l'id
router.get('/:id', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("404 NOT FOUND"))
  }
  Todos.findOne(req.params.id)
  .then((todo) => {
    if (!todo) {
      return next(new Error("404 NOT FOUND"))
    }
    res.format({
      html: () => { // Prepare contenue
        let contenue = '<table class="table"><tr><th>ID</th><th>Description</th><th>Completion</th><th>createdAt</th><th>updatedAt</th><th>userID</th></tr>'
        contenue += '<tr>'
        contenue += '<td>' + todo['id'] + '</td>'
        contenue += '<td>' + todo['name'] + '</td>'
        contenue += '<td>' + todo['completion'] + '</td>'
        contenue += '<td>' + todo['createdAt'] + '</td>'
        contenue += '<td>' + todo['updatedAt'] + '</td>'
        contenue += '<td>' + todo['userId'] + '</td>'
        contenue += '</tr>'
        contenue += '</table>'

        res.render("show", {  
            title: 'Todo n°' + todo['id'],
            h1Title: 'Todo n°' + todo['id'],
            content: contenue
        })
      },
      json: () => {
        res.json(todo)
      }
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})

//afficher l'id sélectionner
router.get('/:id/edit', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("404 NOT FOUND"))
  }
  Todos.findOne(req.params.id)
  .then((todo) => {
    if (!todo) {
      return next(new Error("404 NOT FOUND"))
    }

    let completion = {}

    if(todo.completion === "Todo"){
      completion.todo = true
    }
    if(todo.completion === "In Progress"){
      completion.inProgress = true
    }
    if(todo.completion === "Done"){
      completion.done = true
    }

    res.render("form_todo", {
      title: "Edit a todo",
      formTitle: "Edit todo n°" + req.params.id,
      todo: todo,
      completion: completion,
      idAndMethod: "/" + req.params.id + "?_method=PATCH"
    })
  })
  .catch((err) => {
    return next(new Error("404 NOT FOUND"))
  })
})


//permet ajouter des todos
router.get('/add', (req, res, next) => {
  let userList = ''
  Users.getAllUserIds()
  .then((userIds) => {
    console.log(userIds)
    if (userIds.length <= 0) {
      return next(new Error("500 NEED A USER FIRST"))
    }

    userIds.forEach((userId) => {
      userList += '<option value="' + userId.id + '">' + userId.id + '</option>'
    })

    res.render("form_todo", {
      title: "Ajouter des todos",
      formTitle: "Créer des Todos",
      idAndMethod: "/?_method=POST",
      userList : userList
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})

//update bdd
router.patch('/:id', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("404 NOT FOUND"))
  }

  let changes = {}

  if (req.body.name) {
    changes.name = req.body.name
  }
  if (req.body.completion) {
    changes.completion = req.body.completion
  }

  changes.id = req.params.id

  Todos.update(changes)
  .then((todo) => {
    res.format({
      html: () => {
        res.redirect(301, '/todos')
      },
      json: () => {
        res.json({message : 'sucess'});
      }
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})


//Suppirmer les todos
router.delete('/:id', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("404 NOT FOUND"))
  }
  Todos.findOne(req.params.id)
  .then((todo) => {
    if(!todo){
      return next(new Error("404 NOT FOUND"))
    }
    Todos.delete(req.params.id)
    .then(() => {
      res.format({
        html: () => {
          res.redirect(301, '/todos')
        },
        json: () => {
          res.json({message : 'sucess'})
        }
      })
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})


//ajoute des todos
router.post('/', (req, res, next) => {
  if (!req.body.name) {
    return next(new Error("Please enter a name for the todo"))
  }
  Todos.create([req.body.name, req.body.completion, req.body.userId])
  .then((todo) => {
    res.format({
      html: () => {
        res.redirect(301, '/todos')
      },
      json: () => {
        res.json({message : 'sucess'});

      }
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})

//erreur 404
router.use((err, req, res, next) => {
  res.format({
    html: () => {
      console.log(err)
      res.render("error404", {
        error: err
      })
    },
    json: () => {
      console.log(err)
      res.json({
        message: err.message,
        description: "An error occured"
      })
    }
  })
})


module.exports = router

