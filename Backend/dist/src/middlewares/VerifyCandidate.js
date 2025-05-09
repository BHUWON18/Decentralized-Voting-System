"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyCandidate = void 0;
const zod_1 = require("zod");
const Candidate = zod_1.z.object({
    name: zod_1.z.string({ required_error: "Name is required",
        invalid_type_error: "Name must be a string", }).regex(/^[A-Za-z\s]+$/, { message: "Only alphabets and spaces are allowed" }),
    partyName: zod_1.z.string({ required_error: "Party Name is required",
        invalid_type_error: "Party Name must be a string", }).regex(/^[A-Za-z\s]+$/, { message: "Only alphabets and spaces are allowed" }),
});
const VerifyCandidate = (req, res, next) => {
    try {
        const verify = Candidate.safeParse(req.body);
        if (!verify.success) {
            console.error("Validation Errors: ", verify.error.errors);
            return res.status(400).json({
                message: "Only alphabets and spaces are allowed"
            });
        }
        next();
    }
    catch (error) {
        console.error("Unexpected Error:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.VerifyCandidate = VerifyCandidate;
