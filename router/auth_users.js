const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return new Promise((resolve, reject) => {
      if (!username) {
        reject('Invalid username');
      } else {
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
          reject(`User with username ${username} already exists`);
        } else {
          resolve(true);
        }
      }
    });
  };

const authenticatedUser = (username, password) => {
    return new Promise((resolve, reject) => {
      const isValidUser = users.find((user) => {
        return user.username === username && user.password === password;
      });
      if (isValidUser) {
        resolve();
      } else {
        reject("Invalid username or password.");
      }
    });
  };

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  new Promise((resolve,reject) => {
    if(!username || !password) {
        reject("Customer username/password input is not valid");
      } else {
        authenticatedUser(username,password)
        .then(() =>{
                let accessToken = jwt.sign({
                  data: password,
                }, 'access',{expiresIn: 60 *60});
                req.session.authorization = {
                  accessToken, username
                }
                resolve("Customer successfully logged in!");
        }).catch((error) =>{
          reject(error);
        });
      }
  }).then(result =>{
    res.status(200).send(result);
  }).catch(error =>{
    res.status(404).json({message:error});
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    new Promise((resolve, reject) =>{
        if(username && isbn){
            books[isbn]['reviews'][username] = req.query.review;
            resolve(`Customer review for the book with isbn ${isbn} has been updated/added !!!`);
        } else {
            reject(`bad request!!!`);
        }
    }).then(result =>{
        res.status(200).send(result);
    }).catch(error =>{
        res.status(403).json({message:error});
    })


});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    new Promise((resolve, reject) =>{
        if(username && isbn && books){
            if (books[isbn] && books[isbn]['reviews'] && books[isbn]['reviews'][username]) {
                delete books[isbn]['reviews'][username];
                resolve(`Customer review for the book with isbn ${isbn} has been deleted !!!`);
            } else {
               reject(`The book with ISBN ${isbn} or review for the user ${username} not found!`);
            }
        } else {
            reject(`bad request!!!`);
        }
    }).then(result =>{
        res.status(200).send(result);
    }).catch(error =>{
        res.status(404).json({message:error});
    })

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
