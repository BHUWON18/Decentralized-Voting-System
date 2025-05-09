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
exports.getVotesForCandidate = getVotesForCandidate;
exports.getTotalVoters = getTotalVoters;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load contract artifact
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
if (!process.env.contractAddress || !process.env.RPC_URL) {
    throw new Error("Missing contractAddress or RPC_URL in .env file");
}
// Read the JSON file
const contractAddress = process.env.contractAddress;
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.RPC_URL);
const contractArtifactPath = path_1.default.resolve(__dirname, "../../../blockchain/artifacts/contracts/Voting.sol/Voting.json");
if (!fs_1.default.existsSync(contractArtifactPath)) {
    throw new Error("Contract artifact not found. Run 'truffle compile' or 'hardhat compile'.");
}
const contractArtifact = JSON.parse(fs_1.default.readFileSync(contractArtifactPath, "utf8"));
const contractABI = contractArtifact.abi;
function getVotesForCandidate(candidateId) {
    return __awaiter(this, void 0, void 0, function* () {
        const contract = new ethers_1.ethers.Contract(contractAddress, contractABI, provider);
        const votes = yield contract.getVotesForCandidate(candidateId);
        return Number(votes.toString());
    });
}
function getTotalVoters() {
    return __awaiter(this, void 0, void 0, function* () {
        const contract = new ethers_1.ethers.Contract(contractAddress, contractABI, provider);
        const total = yield contract.getTotalVoters();
        return Number(total.toString());
    });
}
