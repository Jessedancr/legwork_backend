"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.fetchJobs = fetchJobs;
exports.changeStatus = changeStatus;
const express_validator_1 = require("express-validator");
const utils_1 = require("../../../core/configs/utils");
const userTypeEnum_1 = __importDefault(require("../../../core/enums/userTypeEnum"));
async function createJob(req, res) {
    const result = (0, express_validator_1.validationResult)(req);
    console.log("POST jobs/post-job: Validation result: ", result);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    const data = (0, express_validator_1.matchedData)(req);
    const clientId = req.user?._id;
    try {
        const jobData = {
            ...data,
            clientId,
        };
        // * Save the job
        const job = await (0, utils_1.saveJob)(jobData);
        // * Send res back to client
        return res.status(201).json({ message: "Job created successfully", job });
    }
    catch (error) {
        console.error("Error creating job: ", error);
        return res.status(500).json({ message: "Unknown server error" });
    }
}
async function fetchJobs(req, res) {
    const userId = req.user?._id;
    const userType = req.user.userType;
    try {
        //  * If user is client, return jobs posted by the client
        if (userType == userTypeEnum_1.default.Client) {
            const jobs = await (0, utils_1.fetchJobsByClientId)(userId);
            if (!jobs) {
                console.log("No jobs created by client with ID: ", userId);
                return res
                    .status(404)
                    .json({ message: "You have not created any job yet" });
            }
            return res.status(200).json({ message: "Jobs you have posted", jobs });
        }
        // * Else if user is dancer, return all jobs
        else {
            const jobs = await (0, utils_1.fetchAllJobs)();
            if (!jobs) {
                console.log("There are no jobs");
                return res.status(404).json({ message: "No job found" });
            }
            return res.status(200).json({ message: "Jobs found", jobs });
        }
    }
    catch (error) {
        console.log("Error fetching jobs ", error);
        return res.status(500).json({ message: "Unexpected server error" });
    }
}
async function changeStatus(req, res) {
    const { jobId } = req.params;
    const { status } = req.body;
    console.log(`Job ID: ${jobId} - status: ${status}`);
    try {
        if (!jobId || jobId === null || jobId === "" || jobId === undefined) {
            return res.status(400).json({ message: "Bad request, no Job ID found" });
        }
        const result = await (0, utils_1.updateJobStatus)(jobId, status);
        if (!result) {
            console.log("Job not found with ID: ", jobId);
            return res.status(404).json({ message: "Job not found" });
        }
        return res.status(200).json({ message: "Job status updated", result });
    }
    catch (error) {
        console.log("Unknown server error while updating job status: ", error);
        return res.status(500).json({ message: "unknown server error" });
    }
}
