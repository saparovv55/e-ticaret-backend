const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect, adminCheck } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, adminCheck, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminCheck, updateProduct)
  .delete(protect, adminCheck, deleteProduct);

module.exports = router;
