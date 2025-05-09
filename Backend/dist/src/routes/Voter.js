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
exports.VoterRouter = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const VerifyVoter_1 = require("../middlewares/VerifyVoter");
const Authentication_1 = require("../middlewares/Authentication");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
exports.VoterRouter = router;
router.post("/register", VerifyVoter_1.validateVoterRegistration, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const salt = yield bcrypt_1.default.genSalt(Number(process.env.SaltRounds));
        const hashedpassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield prisma.voter.create({
            data: { name, email, password: hashedpassword },
        });
        req.body = Object.assign(Object.assign({}, req.body), { voter: user });
        next();
    }
    catch (err) {
        res.status(409).json({ error: "User already exists" });
    }
}), Authentication_1.GenerateToken);
router.post("/login", VerifyVoter_1.validateVoterLogin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const Existingvoter = yield prisma.voter.findUnique({
            where: {
                email
            },
        });
        console.log(Existingvoter);
        if (Existingvoter) {
            req.body = Object.assign(Object.assign({}, req.body), { voter: Existingvoter });
            next();
        }
        else {
            console.log("user doesnot exists. Please register ");
            return res.status(404).json({ message: "user doesnot exists. Please register" });
        }
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}), Authentication_1.verifyPassword, Authentication_1.GenerateToken);
router.post("/getCandidates", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const candidates = yield prisma.candidate.findMany();
        if (!candidates) {
            console.log(candidates);
            res.status(200).json({
                message: "No records Found"
            });
        }
        console.log(candidates);
        res.status(200).json({
            message: "Candidate returned successfully",
            candidates
        });
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(500).json({ error: "Internal server error while fetching candidates" });
    }
}));
router.post("/getDetails", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.id;
    try {
        const Existingvoter = yield prisma.voter.findUnique({
            where: {
                id,
                isAdmin: false
            },
        });
        console.log(Existingvoter);
        if (Existingvoter) {
            return res.status(200).json({
                message: "user found",
                voter: {
                    name: Existingvoter.name,
                    email: Existingvoter.email
                }
            });
        }
        else {
            console.log("user doesnot exists. Please register ");
            return res.status(404).json({ message: "user doesnot exists. Please register" });
        }
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(500).json({ error: "Internal server error while fetching candidates" });
    }
}));
router.post("/getElection", async (req, res) => {
    try {
      const { id } = req.body;
  
      const election = await prisma.elections.findFirst({
        where: {
          status: "Ongoing"
        }
      });
      
  
      if (!election) {
        console.log("No ongoing election found for the provided ID:", id);
        return res.status(400).json({
          message: "No ongoing Election Found for provided ID",
        });
      }
  
      console.log("Election retrieved successfully:", election);
      return res.status(200).json({
        message: "Election returned successfully",
        election,
      });
  
    } catch (error) {
      console.error("Unexpected Error:", error.message);
      return res.status(500).json({ 
        error: "Internal server error while fetching election details",
      });
    }
  });
  
