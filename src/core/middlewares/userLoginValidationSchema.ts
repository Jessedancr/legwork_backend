export const userLoginValidationSchema = {
  // Username or Email validation
  usernameOrEmail: {
    notEmpty: { errorMessage: "Username or email is required" },
    isString: true,
  },

  // Password validation
  password: {
    notEmpty: { errorMessage: "password is required" },
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be a minimum of 6 characters",
    },
    isString: true,
  },
};
