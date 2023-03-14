const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  new Promise((resolve,reject) =>{
    if(username & password){
        isValid(username)
        .then(result =>{
            users.push({"username":username,"password":password})
            resolve(`Customer Successfully registered. Now you can login!`);
        }).catch(error => {
            reject(error);
        });
    } else {
        reject(`username/password is invalid`);
    }
  }).then(result =>{
    res.status(200).send(result);
  }).catch(error =>{
    res.status(404).json({message:error});
  });
});

// Get the book list available in the shop
public_users.get('/', function(req, res) {
    new Promise((resolve, reject) => {
      const booksJson = JSON.stringify(books);
      resolve({"AllBooks":booksJson});
    })
    .then(result => {
      res.json(result);
    })
    .catch(error => {
      res.status(500).send('Internal Server Error');
    });
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (isbn in books) {
        new Promise((resolve, reject) => {
            resolve({"booksByIsbn": books[isbn]});
        }).then(result => {
            res.send(result);
        }).catch(error => {
            res.status(500).send('Internal Server Error');
        });
    } else {
        new Promise((resolve, reject) => {
            reject(new Error('Book not found'));
        }).catch(error => {
            res.status(404).send('Book not found');
        });
    }
});


  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    new Promise((resolve, reject) => {
      let filteredBooks = Object.values(books).filter((book) => book.author === author);
      if (filteredBooks.length > 0) {
        resolve({"booksByAuthor":filteredBooks});
      } else {
        reject("No books found for the author");
      }
    }).then((result) => {
      res.send(result);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
  });
  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    new Promise((resolve, reject) =>{
            const filteredBooks = Object.values(books).filter((book) => book.title === title);
            resolve({"booksByTitle": filteredBooks});
        }).then((result) =>{
            res.send(result);
        }).catch((error) => {
        res.status(500).send('Internal Server Error');
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    new Promise((resolve, reject) => {
        if (books[isbn] && books[isbn].reviews) {
            resolve({"reviewsByIsbn": books[isbn].reviews});
        } else {
            reject(new Error('Book not found or reviews not available'));
        }
    }).then(result => {
        res.send(result);
    }).catch(error => {
        res.status(500).send('Internal Server Error');
    });
});

module.exports.general = public_users;
