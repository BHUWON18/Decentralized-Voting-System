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
exports.getTotalVoters = exports.getVotesForCandidate = exports.castVote = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
// 🔹 Load environment variables
const CONTRACT_ADDRESS = process.env.contractAddress || "";
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || "";
const RPC_URL = process.env.RPC_URL || "";
// 🔹 Ensure environment variables are set
if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
    throw new Error("Missing required environment variables!");
}
// 🔹 Load ABI from compiled contract JSON
const contractArtifactPath = path_1.default.resolve(__dirname, "../../../blockchain/artifacts/contracts/Voting.sol/Voting.json");
// Read the JSON file
const contractArtifact = JSON.parse(fs_1.default.readFileSync(contractArtifactPath, "utf8"));
const contractABI = contractArtifact.abi;
// 🔹 Set up Ethereum provider & wallet
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
// 🔹 Function to cast a vote
const castVote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { voterId, candidateId, partyName, date } = req.body;
        // Call the contract's castVote function
        if (!voterId || !candidateId || !partyName || !date) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }
        const tx = yield contract.castVote(voterId, candidateId, partyName, date);
        yield tx.wait(); // Wait for transaction confirmation
        res.json({ success: true, txHash: tx.hash });
    }
    catch (error) {
        console.error("Error in castVote:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.castVote = castVote;
// 🔹 Function to get votes for a candidate
const getVotesForCandidate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { candidateId } = req.params;
        if (!candidateId) {
            return res.status(400).json({ success: false, error: "Candidate ID is required" });
        }
        const votes = yield contract.getVotesForCandidate(candidateId);
        res.json({ success: true, votes: votes.toString() });
    }
    catch (error) {
        console.error("Error in getVotesForCandidate:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.getVotesForCandidate = getVotesForCandidate;
// 🔹 Function to get total number of voters
const getTotalVoters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalVoters = yield contract.getTotalVoters();
        res.json({ success: true, totalVoters: totalVoters.toString() });
    }
    catch (error) {
        console.error("Error in getTotalVoters:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.getTotalVoters = getTotalVoters;
