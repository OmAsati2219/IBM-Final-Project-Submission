const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  new Promise((resolve,reject) =>{
    if(username && password){
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


// Get the book list available in the shop without Async/Await
public_users.get('/', function(req, res) {
    res.status(200).send(JSON.stringify(books,null,4));
});


// Get the book list available in the shop using Async/Await
public_users.get('/', async function(req, res) {
    let allbooks = await new Promise((resolve, reject) => {
      resolve({"AllBooks":books});
    })
      res.status(200).send(JSON.stringify(allbooks,null,4));
  });


// Get book details based on ISBN without Promise/Then
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (isbn in books) {
    res.status(200).send(JSON.stringify({"booksByIsbn": books[isbn]},null,4));
  } else {
    res.status(404).json({message:'Book not found'});
  }
});

// Get book details based on ISBN with Promise/Then
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (isbn in books) {
        new Promise((resolve, reject) => {
            resolve({"booksByIsbn": books[isbn]});
        }).then(result => {
            res.status(200).send(JSON.stringify(result,null,4));
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


// Get book details based on author without Promise/Then
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let filteredBooks = Object.values(books).filter((book) => book.author === author);
  if (filteredBooks.length > 0) {
    res.status(200).send(JSON.stringify({"booksByAuthor":filteredBooks},null,4));
  } else {
    res.status(404).json({message:"No books found for the author"});
  }
});
  
// Get book details based on author with Promise/Then
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
      res.status(200).send(JSON.stringify(result,null,4));
    }).catch((err) => {
      console.error(error);
      res.status(404).json({message:error});
    });
  });
  

// Get all books based on title without Promise/Then
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const filteredBooks = Object.values(books).filter((book) => book.title === title);
  if(filteredBooks.length > 0) {
    res.status(200).send(JSON.stringify({"booksByTitle": filteredBooks},null,4));
  } else {
    res.status(404).json({message:`There is no book found in with the title ${title}`});
  }
});

// Get all books based on title with Promise/Then
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    new Promise((resolve, reject) =>{
            const filteredBooks = Object.values(books).filter((book) => book.title === title);
            if(filteredBooks.length > 0) {
              resolve({"booksByTitle": filteredBooks});
            } else {
              reject(`There is no book found in with the title ${title}`);
            }
        }).then((result) =>{
            res.status(200).send(JSON.stringify(result,null,4));
        }).catch((error) => {
        res.status(404).json({message:error});
    });
});


//  Get book review without Promise/Then
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
    res.status(200).send(JSON.stringify({"reviewsByIsbn": books[isbn].reviews},null,4));
} else {
    res.status(404).json({message:'Book not found or reviews not available'});
}

});

//  Get book review with Promise/Then
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    new Promise((resolve, reject) => {
        if (books[isbn] && books[isbn].reviews) {
            resolve({"reviewsByIsbn": books[isbn].reviews});
        } else {
            reject('Book not found or reviews not available');
        }
    }).then(result => {
        res.status(200).send(JSON.stringify(result,null,4));
    }).catch(error => {
        res.status(404).json({message:error});
    });
});

module.exports.general = public_users;