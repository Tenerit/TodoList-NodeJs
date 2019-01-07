const router = require('express')();
//const router = require('express').Router();
const Todos = require('./../sql/todos');
const Users = require('./../sql/users');
const _ = require('lodash');


// GET editing todo
// DONE
router.get('/:id/edit', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("Error 404"))
  }
  Todos.findOne(req.params.id)
  .then((todo) => {
    if (!todo) {
      return next(new Error("Error 404"))
    }

    let completion = {} //niveaux des todos

    if(todo.completion === "A faire"){
      completion.Afaire = true
    }
    if(todo.completion === "En cours"){
      completion.Encours = true
    }
    if(todo.completion === "Done"){
      completion.done = true
    }

    res.render("form_todo", {
      title: "Edit de la todo",
      formTitle: "Edit todo n°" + req.params.id,
      todo: todo,
      completion: completion,
      idAndMethod: "/" + req.params.id + "?_method=PATCH"
    })
  })
  .catch((err) => {
    return next(new Error("Error 404"))
  })
})

//Ajout de la todo

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
      title: "Add a todo",
      formTitle: "Create a Todo",
      idAndMethod: "/?_method=POST",
      userList : userList
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})


// GET a todo
// DONE
router.get('/:id', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("Error 404"))
  }
  Todos.findOne(req.params.id)
  .then((todo) => {
    if (!todo) {
      return next(new Error("Error 404 "))
    }
    res.format({
      html: () => { // Prepare content
        let content = '<table class="table"><tr><th>ID</th><th>Description</th><th>Completion</th><th>createdAt</th><th>updatedAt</th><th>userID</th></tr>'
        content += '<tr>'
        content += '<td>' + todo['id'] + '</td>'
        content += '<td>' + todo['name'] + '</td>'
        content += '<td>' + todo['completion'] + '</td>'
        content += '<td>' + todo['createdAt'] + '</td>'
        content += '<td>' + todo['updatedAt'] + '</td>'
        content += '<td>' + todo['userId'] + '</td>'
        content += '</tr>'
        content += '</table>'

        res.render("show", {  
            title: 'Todo n°' + todo['id'],
            h1Title: 'Todo n°' + todo['id'],
            content: content
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


// EDIT a todo
// DONE
router.patch('/:id', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("Error 404"))
  }

  let changes = {} // Pour connaitre les changements des todos

  if (req.body.name) {
    changes.name = req.body.name
  }
  if (req.body.completion) {
    changes.completion = req.body.completion
  }

  changes.id = req.params.id // Add id

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


// Delete de a todo
router.delete('/:id', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("Error 404"))
  }
  Todos.findOne(req.params.id)
  .then((todo) => {
    if(!todo){
      return next(new Error("404 Error"))
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


//Creation de todos
router.post('/', (req, res, next) => {
  if (!req.body.name) {
    return next(new Error("Entrée le nom de la todo"))
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



//Get des todos
router.get('/', (req, res, next) => {

  Todos.getAll()
  .then((todos) =>
  {

    res.format({
      html: () => {
        let content = '<table class="table"><tr><th>ID</th><th>Description</th><th>Completion</th><th>createdAt</th><th>updatedAt</th><th>userID</th></tr>'
        
        todos.forEach((todo) => {
          content += '<tr>'
          content += '<td>' + todo['id'] + '</td>'
          content += '<td>' + todo['name'] + '</td>'
          content += '<td>' + todo['completion'] + '</td>'
          content += '<td>' + todo['createdAt'] + '</td>'
          content += '<td>' + todo['updatedAt'] + '</td>'
          content += '<td>' + todo['userId'] + '</td>'
          content += '<td> <form action="/todos/'+todo['id']+'/edit/?_method=GET", method="GET"> <button type="submit" class="btn btn-success"><i class="fa fa-pencil fa-lg mr-2"></i>Edit</button> </form> </td>'
          content += '<td> <form action="/todos/'+todo['id']+'/?_method=GET", method="GET"> <button type="submit" class="btn btn-info"><i class="fa fa-eye fa-lg mr-2"></i>See</button> </form> </td>'
          content += '<td> <form action="/todos/'+todo['id']+'/?_method=DELETE", method="POST"> <button type="submit" class="btn btn-danger"><i class="fa fa-trash-o fa-lg mr-2"></i>Remove</button> </form> </td>'
          content += '</tr>'
        })
        
        content += '</table>'

        res.render("index", {  
            title: 'Todolist',
            content: content
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


// Erreur 404
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
        description: "Oh zut une erreur"
      })
    }
  })
})

module.exports = router