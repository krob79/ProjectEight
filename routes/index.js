var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const Op = require('sequelize').Op;
const countPerPage = 5;
let searchQuery = '';

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

/* Main home page and redirect */
router.get('/', (req, res) => {
  res.redirect('/books/?page=0');
});

/* GET home page. */
router.get('/books', asyncHandler(async (req, res, next) => {
  if(searchQuery === ''){
    const {count, rows} = await Book.findAndCountAll({
      offset: parseInt(req.query.page) * countPerPage,
      limit: countPerPage
    });
    const pagesNeeded = count / countPerPage;
    let books = rows;
    let currentPage = parseInt(req.query.page);
    res.render('index', {count, books, pagesNeeded, currentPage});
  }else {
    const {count, rows} = await Book.findAndCountAll({
      offset: parseInt(req.query.page) * countPerPage,
      limit: countPerPage,
      where: { 
        [Op.or]: [
          {title: {[Op.like]: `%${searchQuery}%`}},
          {author: {[Op.like]: `%${searchQuery}%`}},
          {genre: {[Op.like]: `%${searchQuery}%`}},
          {year: {[Op.like]: `%${searchQuery}%`}},
        ] 
      }
    });
    const pagesNeeded = count / countPerPage;
    let books = rows;
    let currentPage = parseInt(req.query.page);
    res.render('index', {count, books, pagesNeeded, currentPage});
  }
  
}));

/* route for search */
router.post('/books/', asyncHandler(async (req, res) => {
  const {count, rows} = await Book.findAndCountAll({
    offset: parseInt(req.query.page) * countPerPage,
    limit: countPerPage,
    where: { 
      [Op.or]: [
        {title: {[Op.like]: `%${req.body.query}%`}},
        {author: {[Op.like]: `%${req.body.query}%`}},
        {genre: {[Op.like]: `%${req.body.query}%`}},
        {year: {[Op.like]: `%${req.body.query}%`}},
      ] 
    }
  });
  searchQuery = req.body.query;
  const pagesNeeded = count / countPerPage;
  let books = rows;
  let currentPage = parseInt(req.query.page);
  res.render('index', {count, books, pagesNeeded, currentPage});
  
}));

/* Create a new book form */
router.get('/books/new', (req, res) => {
  res.render("books/new-book", { book: {}, title: "Create New Book" });
});

/* POST create book. */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body); 
    res.redirect("/books/" + book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError"){
      book = await Book.build(req.body);
      res.render("books/new-book", {book, errors: error.errors, title: "New Book"})
    }else{
      throw error;
    }
  }
  
}));

/* Book detail route */
router.get("/books/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render('books/show', { book: book }); 
  }else{
    let error = new Error();
    error.status = "404";
    error.message = "No book exists with that ID";
    console.log("----ERROR: " + error);
    throw error;
    //res.sendStatus(404);
  }
}));

/* Book update form */
router.get("/books/:id/edit", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render('books/update-book', { book: book }); 
  }else{
    let error = new Error();
    error.status = "404";
    error.message = "Can't edit that book - no book exists with that ID";
    console.log("----ERROR: " + error);
    throw error;
    //res.sendStatus(404);
  }
}));

/* Update individual book */
router.post('/books/:id/edit', asyncHandler(async (req, res) => {
  let book;
  try{
    book = await Book.findByPk(req.params.id);
    if(book){
      await book.update(req.body); //this might need to be changed
      res.redirect("/books/" + book.id);
    }else{
      res.sendStatus(404);
    }
  }catch(error){
    if (error.name === "SequelizeValidationError"){
      book = await Book.build(req.body); //this might need to be changed
      book.id = req.params.id; //make sure correct article gets updated
      res.render("books/update-book", {book, errors: error.errors, title: "Edit Book"})
    }else{
      throw error;
    }
  }
  
  
}));

/* Delete article form. */
router.get("/books/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render("books/delete-book", { book: book, title: "Delete Book" });
  }else{
    let error = new Error();
    error.status = "404";
    error.message = "Can't delete that book - no book exists with that ID";
    console.log("----ERROR: " + error);
    throw error;
    //res.sendStatus(404);
  }
}));

/* Delete individual article. */
router.post('/books/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    await book.destroy();
    res.redirect("/");
  }else{
    res.sendStatus(404);
  }
}));

module.exports = router;
