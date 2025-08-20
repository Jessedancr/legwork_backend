export const userIdValidationSchema = {
  "userId": {
    "isMongoId": {
      "errorMessage": "Invalid user ID"
    },
    "notEmpty": {
      "errorMessage": "User ID is required"
    }
  }
}

