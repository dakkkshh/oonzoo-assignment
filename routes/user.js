var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var { body } = require('express-validator');
const { default: validator } = require('validator');

const userModel = require('../models/user');

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
        isAuthenticated,
        async (req, res) => {
            try {
                const user = req.user;
                return success(res, user);
            } catch (err) {
                log.error(err);
                return error(res, err.message);
            }
        }
    );

router
    .route('/login')
    .post(
        [
            body('email')
                .exists()
                .withMessage('email is required')
                .isEmail()
                .withMessage('invalid email'),
            body('password')
                .exists()
                .withMessage('password is required')
                .isLength({ min: 6 })
                .withMessage('password must be at least 6 characters long')
        ],
        checkError,
        async (req, res) => {
            try {
                const {
                    email,
                    password
                } = req.body;
                const user = await userModel.findOne({ email });
                if (!user){
                    return error(res, 'User not found');
                }
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return error(res, 'Incorrect password');
                }

                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 });
                return success(res, user);
            } catch (err) {
                log.error(err);
                return error(res, err.message);
            }
        }
    );

router
    .route('/signup')
    .post(
        [
            body('name')
                .exists()
                .withMessage('name is required')
                .isLength({ min: 3 })
                .withMessage('name must be at least 3 characters long')
                .isLength({ max: 50 })
                .withMessage('name must be at most 50 characters long'),
            body('email')
                .exists()
                .withMessage('email is required')
                .isEmail()
                .withMessage('invalid email'),
            body('password')
                .exists()
                .withMessage('password is required')
                .isLength({ min: 6 })
                .withMessage('password must be at least 6 characters long')
                .custom((value, { req }) => {
                    if (!validator.isStrongPassword(value)) {
                        return Promise.reject('password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol');
                    }
                    return true;
                })  
        ],
        checkError,
        async (req, res) => {
            try {
                const {
                    name,
                    email,
                    password
                } = req.body;
                const check = await userModel.findOne({ email });
                if (check) return error(res, 'User already exists');
                const encryptedPassword = await bcrypt.hash(password, 10);
                const user = await userModel.create({
                    name,
                    email,
                    password: encryptedPassword
                });
                return success(res, user);
            } catch (err) {
                log.error(err);
                return error(res, err.message);
            }
        }
    );

router
    .route('/logout')
    .get(
        isAuthenticated,
        async (req, res) => {
            try {
                res.clearCookie("jwt");
                return success(res, 'Logged out');
            } catch (err) {
                log.error(err);
                return error(res, err.message);
            }
        }
    );

module.exports = router;
