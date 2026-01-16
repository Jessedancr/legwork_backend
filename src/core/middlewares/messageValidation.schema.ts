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