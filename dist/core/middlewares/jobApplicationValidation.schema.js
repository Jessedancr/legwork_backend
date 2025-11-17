"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationValidationSchema = void 0;
exports.jobApplicationValidationSchema = {
    // * Proposal validation
    proposal: {
        notEmpty: { errorMessage: "Application proposal can't be empty" },
        isString: true,
        isLength: {
            options: { min: 50, max: 1000 },
            errorMessage: "Applications must be between 50 and 1000 characters",
        },
    },
};
