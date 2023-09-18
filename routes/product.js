var express = require('express');
var { body } = require('express-validator');

const productModel = require('../models/product');

const log = require('../logs');

const {
    success,
    error,
    checkError,
    isAuthenticated
} = require('../response');

var router = express.Router();

router
    .route('/')
    .get(
        async (req, res) => {
            try {
                const {
                    page = 1,
                    limit = 10,
                } = req.query;
                const products = await productModel.find()
                    .limit(limit * 1)
                    .skip((page - 1) * limit)
                    .exec();
                const count = await productModel.countDocuments();
                return success(res, {
                    products,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                });
            } catch (err) {
                log.error(err);
                return error(res, err.message);
            }
        }
    );

router
    .route('/:id')
    .get(
        async (req, res) => {
            try {
                const {
                    id
                } = req.params;
                if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                    return error(res, 'Invalid id');
                }
                const product = await productModel.findById(id);
                if (!product) {
                    return error(res, 'Product not found');
                }
                return success(res, product);
            } catch (err) {
                log.error(err);
                return error(res, err.message);
            }
        }
    );

router
    .route('/create')
    .post(
        isAuthenticated,
        [
            body('name')
                .exists()
                .withMessage('name is required')
                .isString()
                .withMessage('name must be a string'),
            body('description')
                .exists()
                .withMessage('description is required')
                .isString()
                .withMessage('description must be a string'),
            body('price')
                .exists()
                .withMessage('price is required')
                .isNumeric()
                .withMessage('price must be a number')
                .custom((value) => {
                    if (value < 1) {
                        throw new Error('price must be greater than 0');
                    }
                    return true;
                })
        ],
        checkError,
        async (req, res) => {
            try {
                const {
                    name,
                    description,
                    price
                } = req.body;
                const product = await productModel.create({
                    name,
                    description,
                    price
                });
                return success(res, product);
            } catch (err) {
                log.error(err);
                return error(res, err.message);
            }
        }
    );

module.exports = router;