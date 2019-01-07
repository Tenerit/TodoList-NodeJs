const router = require('express')();
//const router = require('express').Router();
const Users = require('./../sql/users');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const saltRounds = 10;





//Affiche les todos qui son avec les utlisateur selon son id
router.get('/:id/todos', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("404 NOT FOUND"))
  }
  Users.findOneUser(req.params.id)
  .then((user) =>{
    if (!user) {
      return next(new Error("404 NOT FOUND"))
    }
    Users.getAllTodosForUserId(req.params.id)
    .then((rows) => {
      res.format({
        html: () => {
          
          let contenue = '<table class="table"><tr><th>ID</th><th>Description</th><th>Niveau</th><th>createdAt</th><th>updatedAt</th></tr>'
          
          rows.forEach((row) => {
            contenue += '<tr>'
            contenue += '<td>' + row['id'] + '</td>'
            contenue += '<td>' + row['name'] + '</td>'
            contenue += '<td>' + row['Niveau'] + '</td>'
            contenue += '<td>' + row['createdAt'] + '</td>'
            contenue += '<td>' + row['updatedAt'] + '</td>'
            contenue += '<td> <form action="/todos/'+row['id']+'/edit/?_method=GET", method="GET"> <button type="submit" class="btn btn-success"><i class="fa fa-pencil fa-lg mr-2"></i>Edit</button> </form> </td>'
            contenue += '<td> <form action="/todos/'+row['id']+'/?_method=DELETE", method="POST"> <button type="submit" class="btn btn-danger"><i class="fa fa-trash-o fa-lg mr-2"></i>Remove</button> </form> </td>'
            contenue += '</tr>'
          })
  
          contenue += '</table>'
  
          res.render("index", {  
              title: 'Tous les todo des utilisateurs: ' + req.params.id,
              content: contenue
          })
        },
        json: () => {
            res.json(todos)
        }
      })
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})

//Afficher tous les utilisateurs
router.get('/', (req, res, next) => {

  Users.getAllUsers()
  .then((users) =>
  {
    res.format({
      html: () => {
        let contenue = '<table class="table"><tr><th>ID</th><th>Username</th><th>Firstname</th><th>Lastname</th><th>Email</th><th>createdAt</th><th>updatedAt</th></tr>'
        
        users.forEach((user) => {
          contenue += '<tr>'
          contenue += '<td>' + user['id'] + '</td>'
          contenue += '<td>' + user['username'] + '</td>'
          contenue += '<td>' + user['firstname'] + '</td>'
          contenue += '<td>' + user['lastname'] + '</td>'
          contenue += '<td>' + user['email'] + '</td>'
          contenue += '<td>' + user['createdAt'] + '</td>'
          contenue += '<td>' + user['updatedAt'] + '</td>'
          contenue += '<td> <form action="/users/'+user['id']+'/edit/?_method=GET", method="GET"> <button type="submit" class="btn btn-primary">Modifier</button> </form> </td>'
          contenue += '<td> <form action="/users/'+user['id']+'/todos/?_method=GET", method="GET"> <button type="submit" class="btn btn-success">Afficher tous les todos</button> </form> </td>'
          contenue += '<td> <form action="/users/'+user['id']+'/?_method=DELETE", method="POST"> <button type="submit" class="btn btn-danger">Suppimer</button> </form> </td>'
          contenue += '</tr>'
        })

        contenue += '</table>'
        
        res.render("index", {  
            title: 'User list',
            content: contenue
        })
      },
      json: () => {
          res.json(users)
      }
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})


//Afficher les utlisateur selon leur id
router.get('/:id/edit', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("404 NOT FOUND"))
  }
  Users.findOneUser(req.params.id)
  .then((user) => {
    if (!user) {
      return next(new Error("404 NOT FOUND"))
    }
    res.render("form_user", {
      title: "Patch a user",
      formTitle: "Edit user n°" + req.params.id,
      user: user,
      idAndMethod: "/" + req.params.id + "?_method=PATCH"
    })
  })
  .catch((err) => {
    return next(new Error("404 NOT FOUND"))
  })
})


//Ajouter les utlisateurs
router.get('/add', (req, res, next) => {
    res.render("form_user", {
    title: "Create a user",
    formTitle: "Add a user",
    idAndMethod: "/?_method=POST"
    })
})


//afficher selon l'id
router.get('/:id', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("404 NOT FOUND"))
  }
  Users.findOneUser(req.params.id)
  .then((user) => {
    if(!user){
      return next(new Error("404 NOT FOUND"))
    }
    res.format({
      html: () => { // Prepare contenue

        let contenue = '<table class="table"><tr><th>ID</th><th>Username</th><th>Firstname</th><th>Lastname</th><th>Email</th><th>createdAt</th><th>updatedAt</th></tr>'
        contenue += '<tr>'
        contenue += '<td>' + user['id'] + '</td>'
        contenue += '<td>' + user['username'] + '</td>'
        contenue += '<td>' + user['firstname'] + '</td>'
        contenue += '<td>' + user['lastname'] + '</td>'
        contenue += '<td>' + user['email'] + '</td>'
        contenue += '<td>' + user['createdAt'] + '</td>'
        contenue += '<td>' + user['updatedAt'] + '</td>'
        contenue += '</tr>'
        contenue += '</table>'

        res.render("show", {  
          title: 'Show user ' + user['username'],
          h1Title: "User " + user['username'],
          contenue: contenue
        })
      },
      json: () => {
        res.json(user)
      }
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})


//Met a jours la bdd
router.patch('/:id', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("404 NOT FOUND"))
  }
  if (!req.body.lastname && !req.body.firstname && !req.body.username && !req.body.password && !req.body.password2 && !req.body.email) {
    return next(new Error('To edit you must at least fill a field in fact...'))
  }

  let changes = {}

  if (req.body.firstname) {
    changes.firstname = req.body.firstname
  }
  if (req.body.lastname) {
    changes.lastname = req.body.lastname
  }
  if (req.body.email) {
    changes.email = req.body.email
  }
  if (req.body.username) {
    changes.username = req.body.username
  }
  if (req.body.password) {
    if (req.body.password2 === req.body.password) {
      changes.password = req.body.password
    }else{
      return next(new Error('Different passwords !'))
    }
  }

  changes.id = req.params.id

  Users.updateUser(changes)
  .then((user) => {
    res.format({
      html: () => {
        res.redirect(301, '/users')
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


//Suppime un utilisateurs
router.delete('/:id', (req, res, next) => {
  if (req.params.id % 1 !== 0) {
    return next(new Error("404 NOT FOUND"))
  }
  Users.findOneUser(req.params.id)
  .then((user) => {
    if(!user){
      return next(new Error("404 NOT FOUND"))
    }
    Users.deleteUser(req.params.id)
    .then(() => {
      res.format({
        html: () => {
          res.redirect(301, '/users')
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


//ajoute un utilisateur
router.post('/', (req, res, next) => {
  if (!req.body.lastname || !req.body.firstname || !req.body.username || !req.body.password || !req.body.password2 || !req.body.email) {
    return next(new Error('Please fill in all fields'))
  }
  if (req.body.password != req.body.password2) {
    return next(new Error('Different passwords !'))
  }
  let promise = Promise.resolve()
  .then(async () => {
    let crypt = ''
    await new Promise((resolve, reject) => {
        crypt = bcrypt.hash(req.body.password, saltRounds)
        resolve(crypt)
    })
    return crypt
  })
  .then((encryptedPassword) => {
    Users.createUser([req.body.firstname, req.body.lastname, req.body.username, encryptedPassword, req.body.email])
    .then(() => {})
    res.format({
      html: () => {
        res.redirect(301, '/users')
      },
      json: () => {
        res.json({ message: 'sucess'})
      }
    })
  })
  .catch((err) => {
    console.log(err)
    return next(err)
  })
})

//Erreur 404
router.use((err, req, res, next) => {
  res.format({
    html: () => {
      console.log("error : " + err)
      res.render("error404", {
        error: err
      })
    },
    json: () => {
      console.log("error : " + err)
      res.json({
        message: "Error 500",
        description: "Server Error"
      })
    }
  })
})


module.exports = router