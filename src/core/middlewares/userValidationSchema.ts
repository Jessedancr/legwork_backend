export const userValidationSchema = {
  // * First name validation
  firstName: {
    isLength: {
      options: { min: 3, max: 20 },
      errorMessage: "First name must be between 3 and 20 characters",
    },
    notEmpty: { errorMessage: "First name cannot be empty" },
    isString: true,
  },

  // * Last name validation
  lastName: {
    isLength: {
      options: { min: 3, max: 20 },
      errorMessage: "Last name must be between 3 and 20 characters",
    },
    notEmpty: { errorMessage: "Last name cannot be empty" },
    isString: true,
  },

  // * Username validation
  username: {
    isLength: {
      options: { min: 3, max: 20 },
      errorMessage: "username must be between 3 and 20 characters",
    },
    notEmpty: { errorMessage: "username cannot be empty" },
    isString: true,
  },

  // * Usertype validation
  userType: {
    notEmpty: { errorMessage: "User type cannot be empty" },
    isString: true,
    isIn: {
      options: [["dancer", "client"]],
      errorMessage: "User type must be 'dancer' or 'client'",
    },
  },

  // * Email validation
  email: {
    isEmail: {
      errorMessage: "Invalid email format",
    },
    contains: {
      options: "@gmail.com",
      errorMessage: "Only Gmail addresses are allowed",
    },
  },

  // * Phone number validation
  phoneNumber: {
    notEmpty: { errorMessage: "Phone number cannot be empty" },
    isLength: {
      options: { min: 11, max: 11 },
      errorMessage: "Phone number must be 11 digits",
    },
  },

  // * Password validation
  password: {
    notEmpty: { errorMessage: "Password cannot be empty" },
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be a minimum of 6 characters",
    },
  },
};
