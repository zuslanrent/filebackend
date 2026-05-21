// src/routes/errorRoutes.js
const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');

// Routes
router.get('/', errorController.getAllErrors);
router.get('/:id', errorController.getErrorById);
router.post('/', errorController.createError);
router.put('/:id', errorController.updateError);
router.delete('/:id', errorController.deleteError);
router.patch('/:id/toggle', errorController.toggleStatus);

module.exports = router;