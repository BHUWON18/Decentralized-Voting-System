"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.verifyPassword = exports.GenerateToken = void 0;
const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt_1 = __importDefault(require("bcrypt"));
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const GenerateToken = (req, res) => {
    try {
        const { email } = req.body;
        const value = {
            email
        };
        const token = jwt.sign(value, process.env.JWTPassword, { expiresIn: '1h' });
        res.status(201).json({
            success: true,
            message: "Voter added successfully and token is sent",
            token: token,
            voter: req.body.voter
        });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "error while adding user in token" });
    }
};
exports.GenerateToken = GenerateToken;
const verifyPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    const hashedPassword = req.body.voter.password;
    try {
        bcrypt_1.default.compare(password, hashedPassword, (err, result) => {
            if (err) {
                console.log("error while verifying user ", err.message);
                res.status(404).json({ message: "error while verifying user" });
                return;
            }
            if (result) {
                console.log("User verified and logged in");
                next();
            }
            else {
                console.log("Password mismatch");
                res.status(401).json({ message: "Invalid password" });
            }
        });
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(400).json({ error: "Error while verifying password" });
    }
});
exports.verifyPassword = verifyPassword;
const verifyToken = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; //The ?. operator is used to safely access deeply nested properties without causing an error if one of the properties in the chain is null or undefined
        if (!token) {
            return res.status(400).json({ message: 'Access Denied. No token provided.' });
        }
        jwt.verify(token, process.env.JWTPassword, function (err, decoded) {
            if (err) {
                console.log("error while verifying admin");
                res.status(400).json({ message: "Session expired. Please Login again" });
                return;
            }
            if (decoded) {
                console.log("admin token is verified");
                next();
            }
            else {
                console.log("admin token is not valid");
                res.status(400).json({ message: "admin token is not valid" });
            }
        });
    }
    catch (error) {
        console.log("error while verifying token", error.message);
        res.status(400).json({
            message: "token verification failed"
        });
    }
};
exports.verifyToken = verifyToken;
