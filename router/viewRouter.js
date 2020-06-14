const express = require('express');
const router = express.Router();

const viewController = require('./../controller/viewController');
// const fff = require('./../public/js/index');

router.get('/', viewController.getHomePage);
router.get('/rentalService', viewController.rentalService);

module.exports = router;