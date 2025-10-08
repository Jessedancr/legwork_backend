import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  clientModel,
  dancerModel,
} from "../../features/auth/models/user.schema";
import {
  ClientInterface,
  DancerInterface,
} from "../../features/auth/models/user.interface";
import { Readable } from "stream";
import cloudinary from "../../core/configs/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { JobInterface } from "../../features/jobPosting/models/job.interface";
import { jobModel } from "../../features/jobPosting/models/job.schema";
import { JobApplicationInterface } from "../../features/jobApplication/models/jobApplication.interface";
import { jobApplicationModel } from "../../features/jobApplication/models/jobApplication.schema";
import { ObjectId } from "mongoose";

// * HASH PASSWORD
export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  // * Generate salt
  const salt = await bcrypt.genSalt(saltRounds);

  // * hash password
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

// * COMPARE PASSWORD
export const comparePasswords = async (plain: string, hashed: string) =>
  await bcrypt.compare(plain, hashed);

/**
 * * Check if the user exists in either dancer or client collections
 * * If either exists, return true
 * * Else return false
 */
export const checkUserExists = async (
  username: string,
  email: string,
  phoneNumber: string
): Promise<{ exists: boolean; field?: string; error?: string }> => {
  try {
    // Check username
    const [dancerUsername, clientUsername] = await Promise.all([
      dancerModel.findOne({ username }),
      clientModel.findOne({ username }),
    ]);
    if (dancerUsername || clientUsername) {
      return { exists: true, field: "username" };
    }

    // Check email
    const [dancerEmail, clientEmail] = await Promise.all([
      dancerModel.findOne({ email }),
      clientModel.findOne({ email }),
    ]);
    if (dancerEmail || clientEmail) {
      return { exists: true, field: "email" };
    }

    // Check phone number
    const [dancerPhone, clientPhone] = await Promise.all([
      dancerModel.findOne({ phoneNumber }),
      clientModel.findOne({ phoneNumber }),
    ]);
    if (dancerPhone || clientPhone) {
      return { exists: true, field: "phoneNumber" };
    }

    return { exists: false };
  } catch (error) {
    console.error("Unknown error in checkUserExists func", error);
    return {
      exists: false,
      error: "Unexpected error while checking if user exists",
    };
  }
};

// * SAVE DANCER TO DB
export const saveDancer = async (dancerData: DancerInterface) => {
  const dancer = new dancerModel(dancerData);
  try {
    // * Save to db
    const savedDancer = await dancer.save();
    return savedDancer;
  } catch (error) {
    console.log("Error saving dancer to db: ", error);
    throw error;
  }
};

// * SAVE CLIENT TO DB
export const saveClient = async (clientData: ClientInterface) => {
  const client = new clientModel(clientData);
  try {
    // * Save to db
    const savedClient = await client.save();
    return savedClient;
  } catch (error) {
    console.log("Error saving client to db: ", error);
    throw error;
  }
};

// * GENERATE JWT TOKENS
export const accessTokenMaxAge = 60 * 60 * 24; // 1 day
export const refreshTokenMaxAge = 60 * 60 * 24 * 7; // 1 week
export const generateAccessToken = async (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: accessTokenMaxAge,
  });
};
export const generateRefreshToken = async (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: refreshTokenMaxAge,
  });
};

// * VERIFY JWT TOKENS
export const verifyAccessToken = async (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};
export const verifyRefreshToken = async (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
};

/**
 * * FIND USER
 * * This function is used during login
 */
export const findUserByUsernameOrEmail = async (identifier: string) => {
  try {
    // * Find user by username or email
    const [dancer, client] = await Promise.all([
      dancerModel.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      }),
      clientModel.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      }),
    ]);
    if (dancer) {
      console.log("Dancer found");
      return dancer;
    } else if (client) {
      console.log("Client found");
      return client;
    } else {
      console.log("user not found");
      return null;
    }
  } catch (error) {
    console.log("Error finding user: ", error);
    return null;
  }
};

// * FIND USER BY ID
export const findUserById = async (id: string) => {
  try {
    const [dancer, client] = await Promise.all([
      dancerModel.findById(id),
      clientModel.findById(id),
    ]);

    if (dancer) {
      return dancer;
    } else if (client) {
      return client;
    } else {
      console.log("User not found in either collection");
      return null;
    }
  } catch (error) {
    console.log("Error finding user by ID: ", error);
    return null;
  }
};

// * FIND USER BY ID AND UPDATE
export const findUserAndUpdate = async (
  id: string,
  updateData: Record<string, any>
) => {
  try {
    const [updatedDancer, updatedClient] = await Promise.all([
      dancerModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }),
      clientModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }),
    ]);

    if (updatedDancer) {
      return updatedDancer;
    } else if (updatedClient) {
      return updatedClient;
    } else {
      console.log("User not found in either collection");
      return null;
    }
  } catch (error) {
    console.log("Error finding  and updating user: ", error);
    return error;
  }
};

// * CLOUDINARY UPLOAD SETUP
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },

        (error, result) => {
          if (error) {
            console.error("Failed to upload to cloudinary: ", error);
            return reject(error);
          }
          if (!result) {
            return reject(
              new Error("Cloudinary upload returned undefined result")
            );
          }
          resolve(result);
        }
      );
      // Pipe the buffer to the Cloudinary upload stream
      Readable.from(buffer).pipe(stream);
    });
  } catch (error) {
    console.log("Unexpected cloudinary stream error: ", error);
    return Promise.reject(error);
  }
};

// * SAVE JOB TO DB
export const saveJob = async (jobData: JobInterface) => {
  const job = new jobModel(jobData);

  try {
    const savedJob = await job.save();
    return savedJob;
  } catch (error) {
    console.log("Error saving job to DB: ", error);
    throw error;
  }
};

// * FETCH ALL JOBS
export const fetchAllJobs = async () => {
  try {
    const jobs = await jobModel.find({ status: true }).sort({ createdAt: -1 });
    return jobs;
  } catch (error) {
    console.log("Error fetching all jobs: ", error);
    return null;
  }
};

// * FETCH JOBS BY CLIENT ID
export const fetchJobsByClientId = async (clientId: string) => {
  try {
    const jobs = await jobModel.find({ clientId }).sort({ createdAt: -1 });
    return jobs;
  } catch (error) {
    console.log("Error fetching jobs by client ID: ", error);
    return null;
  }
};

// * UPDATE JOB STATUS
export const updateJobStatus = async (jobId: string, jobStatus: boolean) => {
  try {
    const updatedJobDoc = await jobModel.findByIdAndUpdate(
      jobId,
      { $set: { status: jobStatus } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedJobDoc) {
      console.log(`Job with ID ${jobId} not found`);
      return null;
    }
    return updatedJobDoc;
  } catch (error) {
    console.log("Error finding and updating job: ", error);
    return error;
  }
};

const getClientIdFromJob = async (jobId: ObjectId) => {
  try {
    const job = await jobModel.findById(jobId);
    if (!job) {
      console.log(`Job with ID ${jobId} not found`);
      throw new Error("The job you are applying for does not exist");
    }
    return job.clientId;
  } catch (error) {
    console.log("Error getting client ID from job: ", error);
    return null;
  }
};

export const saveJobApplication = async (
  jobApplicationData: JobApplicationInterface
): Promise<{
  exists: boolean;
  application: JobApplicationInterface;
}> => {
  const application = new jobApplicationModel(jobApplicationData);

  try {
    // Query the collection to ensure a unique application per dancer per job
    const existingApplication = await jobApplicationModel.findOne({
      dancerId: jobApplicationData.dancerId,
      jobId: jobApplicationData.jobId,
    });

    if (existingApplication) {
      return { exists: true, application: existingApplication };
    }

    const clientId = await getClientIdFromJob(jobApplicationData.jobId);
    application.clientId = clientId as ObjectId;

    const savedApplication = await application.save();
    return { exists: false, application: savedApplication };
  } catch (error) {
    console.log("Error saving job application to DB: ", error);
    throw error;
  }
};
