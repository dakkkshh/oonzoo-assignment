var express = require('express');

const userRouter = require('./user');
const productRouter = require('./product');

var router = express.Router();

router.use('/user', userRouter);
router.use('/product', productRouter);

module.exports = router;