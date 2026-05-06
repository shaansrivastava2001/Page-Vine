const express = require("express");

const BooksController = require("../controllers/books.controller");
const tokenMiddleware = require('../middlewares/token.middleware');

const router = express.Router();

// Routes for CRUD of Books Model
router.post("/books/getBooks", tokenMiddleware, BooksController.getBooks);

// Dashboard stats (auth-required, no role gating)
router.get("/books/stats", tokenMiddleware, BooksController.getStats);

// Book requests — list + fulfill (auth-required, all roles)
router.get("/books/requests", tokenMiddleware, BooksController.getRequests);
router.post("/books/requests/:id/fulfill", tokenMiddleware, BooksController.fulfillRequest);

router.post("/books/addBook", tokenMiddleware, BooksController.addBook);
router.get("/books/getBook/:id", tokenMiddleware, BooksController.findBookById);
router.put("/books/updateBook/:id", tokenMiddleware, BooksController.updateBook);
router.delete("/books/deleteBook/:id", BooksController.deleteBook);
router.post("/books/requestBook", tokenMiddleware, BooksController.requestBook);

module.exports = router;