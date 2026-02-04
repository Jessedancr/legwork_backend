export const createChatRoomValidation = {
  dancerId: {
    notEmpty: {
      errorMessage: "Dancer ID cannot be empty",
    },
  },
  clientId: {
    notEmpty: {
      errorMessage: "Client ID cannot be empty",
    },
  },
};

// export const sendMessageValidation = {
//   chatRoomId: {
//     notEmpty: {
//       errorMessage: "Chat room ID cannot be empty",
//     },
//   },
//   content: {
//     trim: true,
//     isLength: {
//       options: { min: 1, max: 1000 },
//       errorMessage: "Message content must be between 1 and 1000 characters",
//     },
//     notEmpty: {
//       errorMessage: "Message content cannot be empty",
//     },
//   },
// };

// export const getMessagesValidation = {
//   chatRoomId: {
//     in: ["params"],
//     isMongoId: {
//       errorMessage: "Valid chat room ID is required",
//     },
//     notEmpty: {
//       errorMessage: "Chat room ID cannot be empty",
//     },
//   },
//   page: {
//     in: ["query"],
//     optional: true,
//     isInt: {
//       options: { min: 1 },
//       errorMessage: "Page must be a positive integer",
//     },
//   },
//   limit: {
//     in: ["query"],
//     optional: true,
//     isInt: {
//       options: { min: 1, max: 100 },
//       errorMessage: "Limit must be between 1 and 100",
//     },
//   },
// };

// export const updateMessageStatusValidation = {
//   messageId: {
//     in: ["params"],
//     isMongoId: {
//       errorMessage: "Valid message ID is required",
//     },
//     notEmpty: {
//       errorMessage: "Message ID cannot be empty",
//     },
//   },
//   status: {
//     in: ["body"],
//     isIn: {
//       options: [["SENT", "DELIVERED", "READ"]],
//       errorMessage: "Status must be SENT, DELIVERED, or READ",
//     },
//     notEmpty: {
//       errorMessage: "Status cannot be empty",
//     },
//   },
// };

// export const deleteMessageValidation = {
//   messageId: {
//     in: ["params"],
//     isMongoId: {
//       errorMessage: "Valid message ID is required",
//     },
//     notEmpty: {
//       errorMessage: "Message ID cannot be empty",
//     },
//   },
// };
