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
exports.AdminRouter = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const VerifyVoter_1 = require("../middlewares/VerifyVoter");
const Authentication_1 = require("../middlewares/Authentication");
const VerifyCandidate_1 = require("../middlewares/VerifyCandidate");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
exports.AdminRouter = router;
router.post("/register", VerifyVoter_1.validateVoterRegistration, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const salt = yield bcrypt_1.default.genSalt(Number(process.env.SaltRounds));
        const hashedpassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield prisma.voter.create({
            data: { name, email, password: hashedpassword, isAdmin: true },
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
                email,
                isAdmin: true
            },
        });
        console.log(Existingvoter);
        if (Existingvoter) {
            req.body = Object.assign(Object.assign({}, req.body), { voter: Existingvoter });
            next();
        }
        else {
            console.log("admin doesnot exists. Please register ");
            return res.status(401).json({ message: "Access Denied. Admins only Or Incorrect email or password" });
        }
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}), Authentication_1.verifyPassword, Authentication_1.GenerateToken);
router.post("/addCandidate", VerifyCandidate_1.VerifyCandidate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, partyName } = req.body;
    try {
        const candidate = yield prisma.candidate.create({
            data: {
                name, partyName
            },
        });
        console.log("Added candidate is", candidate);
        res.status(200).json({
            message: "Candidate successfully added",
            candidate
        });
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(500).json({ error: "Internal server error while adding candidate" });
    }
}));
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
router.post("/updateCandidate", VerifyCandidate_1.VerifyCandidate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, partyName, id } = req.body;
    try {
        const candidate = yield prisma.candidate.update({
            where: {
                id
            },
            data: {
                name, partyName, id
            }
        });
        console.log(candidate);
        res.status(200).json({
            message: "Candidate updated successfully"
        });
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(400).json({ error: "No record Found" });
    }
}));
router.post("/deleteCandidate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const candidate = yield prisma.candidate.delete({
            where: {
                id
            },
        });
        console.log(candidate);
        res.status(200).json({
            message: "Candidate deleted successfully"
        });
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(500).json({ error: "No record Found" });
    }
}));
router.post("/getElectionDetails", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const statusCounts = yield prisma.elections.groupBy({
            by: ["status"],
            _count: {
                status: true,
            },
        });
        console.log(statusCounts);
        const result = {};
        statusCounts.forEach((item) => {
            result[item.status] = item._count.status;
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
router.post("/createElection", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, startDate, endDate, startTime, endTime } = req.body;
        // Convert string dates to Date objects
        const formattedStartDate = new Date(`${startDate}T00:00:00Z`);
        const formattedEndDate = new Date(`${endDate}T00:00:00Z`);
        const election = yield prisma.elections.create({
            data: {
                name,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                startTime,
                endTime,
                status: "Ongoing",
            },
        });
        console.log("Added election is", election);
        res.status(200).json({
            message: "Candidate successfully added",
            election
        });
    }
    catch (error) {
        console.log("error occured");
    }
}));
router.post("/getElection", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.id;
        const election = yield prisma.elections.findUnique({
            where: { id }
        });
        if (!election) {
            console.log(election);
            res.status(200).json({
                message: "No records Found"
            });
        }
        console.log(election);
        res.status(200).json({
            message: "election returned successfully",
            election
        });
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(500).json({ error: "Internal server error while fetching election details" });
    }
}));
router.post("/endElection", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.id;
        const election = yield prisma.elections.update({
            where: {
                id
            },
            data: {
                status: "Completed"
            }
        });
        console.log(election);
        res.status(200).json({
            message: "Election ended successfully"
        });
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(400).json({ error: "No record Found" });
    }
}));
