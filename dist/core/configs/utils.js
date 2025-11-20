"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationToDevice = exports.updateApplicationStatus = exports.fetchApplicationsByDancerId = exports.fetchApplicationsByJobId = exports.saveJobApplication = exports.updateJobStatus = exports.fetchJobsByClientId = exports.fetchAllJobs = exports.saveJob = exports.uploadToCloudinary = exports.findUserAndUpdate = exports.findUserById = exports.findUserByUsernameOrEmail = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = exports.refreshTokenMaxAge = exports.accessTokenMaxAge = exports.saveClient = exports.saveDancer = exports.checkUserExists = exports.comparePasswords = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = require("../../features/auth/models/user.schema");
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("../../core/configs/cloudinary"));
const job_schema_1 = require("../../features/jobPosting/models/job.schema");
const jobApplication_schema_1 = require("../../features/jobApplication/models/jobApplication.schema");
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
// var serviceAccount = require("../../../assets/push-notif-key.json");
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Handle newlines
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CERT_URL,
};
const app = (0, app_1.initializeApp)({
    credential: (0, app_1.cert)(serviceAccount),
});
// * HASH PASSWORD
const hashPassword = async (password) => {
    const saltRounds = 10;
    // * Generate salt
    const salt = await bcrypt_1.default.genSalt(saltRounds);
    // * hash password
    const hash = await bcrypt_1.default.hash(password, salt);
    return hash;
};
exports.hashPassword = hashPassword;
// * COMPARE PASSWORD
const comparePasswords = async (plain, hashed) => await bcrypt_1.default.compare(plain, hashed);
exports.comparePasswords = comparePasswords;
/**
 * * Check if the user exists in either dancer or client collections
 * * If either exists, return true
 * * Else return false
 */
const checkUserExists = async (username, email, phoneNumber) => {
    try {
        // Check username
        const [dancerUsername, clientUsername] = await Promise.all([
            user_schema_1.dancerModel.findOne({ username }),
            user_schema_1.clientModel.findOne({ username }),
        ]);
        if (dancerUsername || clientUsername) {
            return { exists: true, field: "username" };
        }
        // Check email
        const [dancerEmail, clientEmail] = await Promise.all([
            user_schema_1.dancerModel.findOne({ email }),
            user_schema_1.clientModel.findOne({ email }),
        ]);
        if (dancerEmail || clientEmail) {
            return { exists: true, field: "email" };
        }
        // Check phone number
        const [dancerPhone, clientPhone] = await Promise.all([
            user_schema_1.dancerModel.findOne({ phoneNumber }),
            user_schema_1.clientModel.findOne({ phoneNumber }),
        ]);
        if (dancerPhone || clientPhone) {
            return { exists: true, field: "phoneNumber" };
        }
        return { exists: false };
    }
    catch (error) {
        console.error("Unknown error in checkUserExists func", error);
        return {
            exists: false,
            error: "Unexpected error while checking if user exists",
        };
    }
};
exports.checkUserExists = checkUserExists;
// * SAVE DANCER TO DB
const saveDancer = async (dancerData) => {
    const dancer = new user_schema_1.dancerModel(dancerData);
    try {
        // * Save to db
        const savedDancer = await dancer.save();
        return savedDancer;
    }
    catch (error) {
        console.log("Error saving dancer to db: ", error);
        throw error;
    }
};
exports.saveDancer = saveDancer;
// * SAVE CLIENT TO DB
const saveClient = async (clientData) => {
    const client = new user_schema_1.clientModel(clientData);
    try {
        // * Save to db
        const savedClient = await client.save();
        return savedClient;
    }
    catch (error) {
        console.log("Error saving client to db: ", error);
        throw error;
    }
};
exports.saveClient = saveClient;
// * GENERATE JWT TOKENS
exports.accessTokenMaxAge = 60 * 60 * 24; // 1 day
exports.refreshTokenMaxAge = 60 * 60 * 24 * 7; // 1 week
const generateAccessToken = async (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: exports.accessTokenMaxAge,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = async (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: exports.refreshTokenMaxAge,
    });
};
exports.generateRefreshToken = generateRefreshToken;
// * VERIFY JWT TOKENS
const verifyAccessToken = async (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = async (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * * FIND USER
 * * This function is used during login
 */
const findUserByUsernameOrEmail = async (identifier) => {
    try {
        // * Find user by username or email
        const [dancer, client] = await Promise.all([
            user_schema_1.dancerModel.findOne({
                $or: [{ username: identifier }, { email: identifier }],
            }),
            user_schema_1.clientModel.findOne({
                $or: [{ username: identifier }, { email: identifier }],
            }),
        ]);
        if (dancer) {
            console.log("Dancer found");
            return dancer;
        }
        else if (client) {
            console.log("Client found");
            return client;
        }
        else {
            console.log("user not found");
            return null;
        }
    }
    catch (error) {
        console.log("Error finding user: ", error);
        return null;
    }
};
exports.findUserByUsernameOrEmail = findUserByUsernameOrEmail;
// * FIND USER BY ID
const findUserById = async (id) => {
    try {
        const [dancer, client] = await Promise.all([
            user_schema_1.dancerModel.findById(id),
            user_schema_1.clientModel.findById(id),
        ]);
        if (dancer) {
            return dancer;
        }
        else if (client) {
            return client;
        }
        else {
            console.log("User not found in either collection");
            return null;
        }
    }
    catch (error) {
        console.log("Error finding user by ID: ", error);
        return null;
    }
};
exports.findUserById = findUserById;
// * FIND USER BY ID AND UPDATE
const findUserAndUpdate = async (id, updateData) => {
    try {
        const [updatedDancer, updatedClient] = await Promise.all([
            user_schema_1.dancerModel.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            }),
            user_schema_1.clientModel.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            }),
        ]);
        if (updatedDancer) {
            return updatedDancer;
        }
        else if (updatedClient) {
            return updatedClient;
        }
        else {
            console.log("User not found in either collection");
            return null;
        }
    }
    catch (error) {
        console.log("Error finding  and updating user: ", error);
        return error;
    }
};
exports.findUserAndUpdate = findUserAndUpdate;
// * CLOUDINARY UPLOAD SETUP
const uploadToCloudinary = (buffer, folder) => {
    try {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.default.uploader.upload_stream({
                folder,
                resource_type: "auto",
            }, (error, result) => {
                if (error) {
                    console.error("Failed to upload to cloudinary: ", error);
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error("Cloudinary upload returned undefined result"));
                }
                resolve(result);
            });
            // Pipe the buffer to the Cloudinary upload stream
            stream_1.Readable.from(buffer).pipe(stream);
        });
    }
    catch (error) {
        console.log("Unexpected cloudinary stream error: ", error);
        return Promise.reject(error);
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
// * SAVE JOB TO DB
const saveJob = async (jobData) => {
    const job = new job_schema_1.jobModel(jobData);
    try {
        const savedJob = await job.save();
        return savedJob;
    }
    catch (error) {
        console.log("Error saving job to DB: ", error);
        throw error;
    }
};
exports.saveJob = saveJob;
// * FETCH ALL JOBS
const fetchAllJobs = async () => {
    try {
        const jobs = await job_schema_1.jobModel.find({ status: true }).sort({ createdAt: -1 });
        return jobs;
    }
    catch (error) {
        console.log("Error fetching all jobs: ", error);
        return null;
    }
};
exports.fetchAllJobs = fetchAllJobs;
// * FETCH JOBS BY CLIENT ID
const fetchJobsByClientId = async (clientId) => {
    try {
        const jobs = await job_schema_1.jobModel.find({ clientId }).sort({ createdAt: -1 });
        return jobs;
    }
    catch (error) {
        console.log("Error fetching jobs by client ID: ", error);
        return null;
    }
};
exports.fetchJobsByClientId = fetchJobsByClientId;
// * UPDATE JOB STATUS
const updateJobStatus = async (jobId, jobStatus) => {
    try {
        const updatedJobDoc = await job_schema_1.jobModel.findByIdAndUpdate(jobId, { $set: { status: jobStatus } }, {
            new: true,
            runValidators: true,
        });
        if (!updatedJobDoc) {
            console.log(`Job with ID ${jobId} not found`);
            return null;
        }
        return updatedJobDoc;
    }
    catch (error) {
        console.log("Error finding and updating job: ", error);
        return error;
    }
};
exports.updateJobStatus = updateJobStatus;
const getClientIdFromJob = async (jobId) => {
    try {
        const job = await job_schema_1.jobModel.findById(jobId);
        if (!job) {
            console.log(`Job with ID ${jobId} not found`);
            throw new Error("The job you are applying for does not exist");
        }
        return job.clientId;
    }
    catch (error) {
        console.log("Error getting client ID from job: ", error);
        return null;
    }
};
const saveJobApplication = async (jobApplicationData) => {
    const application = new jobApplication_schema_1.jobApplicationModel(jobApplicationData);
    try {
        // Query the collection to ensure a unique application per dancer per job
        const existingApplication = await jobApplication_schema_1.jobApplicationModel.findOne({
            dancerId: jobApplicationData.dancerId,
            jobId: jobApplicationData.jobId,
        });
        if (existingApplication) {
            return { exists: true, application: existingApplication };
        }
        const clientId = await getClientIdFromJob(jobApplicationData.jobId);
        application.clientId = clientId;
        const savedApplication = await application.save();
        return { exists: false, application: savedApplication };
    }
    catch (error) {
        console.log("Error saving job application to DB: ", error);
        throw error;
    }
};
exports.saveJobApplication = saveJobApplication;
const fetchApplicationsByJobId = async (jobId, clientId) => {
    try {
        const apps = await jobApplication_schema_1.jobApplicationModel
            .find({ jobId: jobId, clientId: clientId })
            .sort({ createdAt: -1 });
        return apps;
    }
    catch (error) {
        console.log("Error fetching applications by job ID: ", error);
        return null;
    }
};
exports.fetchApplicationsByJobId = fetchApplicationsByJobId;
const fetchJobById = async (id) => {
    try {
        const job = await job_schema_1.jobModel.findById(id);
        return job;
    }
    catch (error) {
        console.log("Error fetching job by ID: ", error);
        return null;
    }
};
const fetchApplicationsByDancerId = async (dancerId) => {
    try {
        const apps = await jobApplication_schema_1.jobApplicationModel
            .find({ dancerId })
            .sort({ createdAt: -1 });
        const appsWithJobs = await Promise.all(apps.map(async (app) => {
            const job = await fetchJobById(app.jobId);
            return { application: app, job };
        }));
        return appsWithJobs;
    }
    catch (error) {
        console.log("Error fetching applications be Dancer ID: ", error);
        return null;
    }
};
exports.fetchApplicationsByDancerId = fetchApplicationsByDancerId;
const updateApplicationStatus = async (applicationId, status) => {
    try {
        const updatedApp = await jobApplication_schema_1.jobApplicationModel.findByIdAndUpdate(applicationId, { $set: { applicationStatus: status } }, { new: true, runValidators: true });
        return updatedApp;
    }
    catch (error) {
        console.log("Failed to update application status: ", error);
        return null;
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
const sendNotificationToDevice = async (deviceToken, title, body, channelId) => {
    const message = {
        notification: {
            title,
            body,
        },
        token: deviceToken,
        data: { channelId: channelId || "system_channel" },
        android: {
            priority: "high",
            notification: { channelId: channelId || "system_channel" },
        },
    };
    try {
        const res = await (0, messaging_1.getMessaging)(app).send(message);
        console.log("Notification sent successfully: ", res);
        return res;
    }
    catch (error) {
        console.error("Error sending notification: ", error);
        throw error;
    }
};
exports.sendNotificationToDevice = sendNotificationToDevice;
