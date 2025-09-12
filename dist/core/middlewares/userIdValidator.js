"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdValidationSchema = void 0;
exports.userIdValidationSchema = {
    "userId": {
        "isMongoId": {
            "errorMessage": "Invalid user ID"
        },
        "notEmpty": {
            "errorMessage": "User ID is required"
        }
    }
};
