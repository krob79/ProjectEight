var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
  let books = await Book.findAll();
  console.log(books);
  res.render('index', { title: 'Here are my books!', books: books });
  
}));

/* Create a new book form */
router.get('/book/new', (req, res) => {
  res.render("books/new", { book: {}, title: "Create New Book" });
});

/* Book detail route */
router.get("/book/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render('books/show', { book: book }); 
  }else{
    res.sendStatus(404);
  }
}));

/* POST create article. */
router.post('/', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body); 
    res.redirect("/book/" + book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError"){
      book = await Book.build(req.body);
      res.render("book/new", {book, errors: error.errors, title: "New Book"})
    }else{
      throw error;
    }
  }
  
}));

/* Book update form */
router.get("/book/:id/edit", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render('books/edit', { book: book }); 
  }else{
    res.sendStatus(404);
  }
}));

/* Update individual book */
router.post('/book/:id/edit', asyncHandler(async (req, res) => {
  let book;
  try{
    book = await Book.findByPk(req.params.id);
    if(book){
      await book.update(req.body); //this might need to be changed
      res.redirect("/book/" + book.id);
    }else{
      res.sendStatus(404);
    }
  }catch(error){
    if (error.name === "SequelizeValidationError"){
      book = await Book.build(req.body); //this might need to be changed
      book.id = req.params.id; //make sure correct article gets updated
      res.render("books/edit", {book, errors: error.errors, title: "Edit Book"})
    }else{
      throw error;
    }
  }
  
  
}));

/* Delete article form. */
router.get("/book/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render("books/delete", { book: book, title: "Delete Book" });
  }else{
    res.sendStatus(404);
  }
}));

/* Delete individual article. */
router.post('/book/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    await book.destroy();
    res.redirect("/");
  }else{
    res.sendStatus(404);
  }
}));

module.exports = router;
