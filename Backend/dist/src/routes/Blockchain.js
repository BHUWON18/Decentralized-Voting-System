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
exports.BlockchainRouter = void 0;
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
exports.BlockchainRouter = router;
const contractPath = path_1.default.join(__dirname, "../../../../blockchain/build/contracts/Voting.json");
const abi = JSON.parse(fs_1.default.readFileSync(contractPath, "utf8")).abi;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.contractAddress;
if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error("Missing required environment variables.");
}
// // Connect to Ethereum provider
// const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL); // Ganache RPC
const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
// **API to cast a vote**
router.post("/cast", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { voterId, candidateId, partyName } = req.body;
    if (!voterId || !candidateId || !partyName) {
        return res.status(400).json({ error: "All fields are required" });
    }
    const date = new Date().toISOString().split("T")[0];
    try {
        console.log(`Casting vote for: ${voterId} -> ${candidateId} (${partyName}) on ${date}`);
        const tx = yield contract.castVote(voterId, String(candidateId), partyName, date);
        yield tx.wait();
        res.json({ success: true, message: "Vote successfully cast!", transactionHash: tx.hash });
    }
    catch (error) {
        console.error("Error casting vote:", error);
        if (error.reason === "Voter has already voted!") {
            return res.status(400).json({ error: "Voter has already voted!" });
        }
        res.status(500).json({ error: "Failed to cast vote", details: error.message });
    }
}));
router.post("/getStats", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch total voters in PostgreSQL using Prisma
        const totalRegisteredVoters = yield prisma.voter.count({
            where: {
                isAdmin: false
            }
        });
        // Fetch total voters who voted from Blockchain
        const totalVotersOnChain = yield contract.getTotalVoters();
        res.json({
            totalRegisteredVoters,
            totalVotersOnChain: Number(totalVotersOnChain)
        });
    }
    catch (error) {
        console.error("Error fetching voter stats:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.post("/hasVoted", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.id;
        // Fetch total voters in PostgreSQL using Prisma
        // Fetch total voters who voted from Blockchain
        const HasVoted = yield contract.hasVoted(String(id));
        res.json({
            HasVoted
        });
    }
    catch (error) {
        console.error("Error fetching voter status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.get("/all-votes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // **Step 1: Fetch all candidate IDs from the database**
        const candidates = yield prisma.candidate.findMany();
        let results = [];
        // **Step 2: Loop through candidates & get votes from blockchain**
        for (const candidate of candidates) {
            try {
                const votes = yield contract.getVotesForCandidate(String(candidate.id));
                results.push({ candidateId: candidate.id, name: candidate.name, party: candidate.partyName, votes: Number(votes) });
            }
            catch (err) {
                console.error(`Error fetching votes for ${String(candidate.id)}:`, err);
                results.push({ candidateId: candidate.id, name: candidate.name, party: candidate.partyName, votes: 0 }); // Default to 0
            }
        }
        res.json({ totalCandidates: candidates.length, results });
    }
    catch (error) {
        console.error("Error fetching votes:", error);
        res.status(500).json({ error: "Failed to fetch votes" });
    }
}));
