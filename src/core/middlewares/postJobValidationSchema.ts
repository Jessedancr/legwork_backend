import { body } from "express-validator";

export const postJobValidationSchema = {
  // * Job title validation
  jobTitle: {
    isString: true,
    notEmpty: { errorMessage: "Job title can not be empty" },
    isLength: {
      options: { min: 5 },
      errorMessage: "Job title can not be less than 5 characters",
    },
  },

  // * Job location validation
  jobLocation: {
    isLength: {
      options: { min: 5 },
      errorMessage: "Job location can not be less than 5 characters",
    },
    notEmpty: { errorMessage: "Job location can not be empty" },
  },

  // * Preffered dance styles validation
  prefDanceStyles: {
    notEmpty: { errorMessage: "Preffered dance styles can't be empty" },
    isArray: {
      options: { min: 1 },
      errorMessage: "You must have at least one preffered dance style",
    },
  },

  // * Dancers pay validation
  pay: {
    notEmpty: { errorMessage: "Dancer's pay can't be empty" },
    isString: true,
  },

  // * Amt of dancers validation
  amtOfDancers: {
    notEmpty: { errorMessage: "Amount of dancers can't be empty" },
    isString: true,
  },

  // * Job duration validation
  jobDuration: {
    notEmpty: { errorMessage: "Job duration can't be empty" },
    isString: true,
  },

  // * Job descr validation
  jobDescr: {
    notEmpty: { errorMessage: "Job description can't be empty" },
    isString: true,
    isLength: {
      options: { min: 10, max: 150 },
      errorMessage: "Job description must be between 10 and 150 characters",
    },
  },

  // * Job type validation
  jobType: {
    notEmpty: { errorMessage: "Job type can't be empty" },
    isString: true,
  },
};
