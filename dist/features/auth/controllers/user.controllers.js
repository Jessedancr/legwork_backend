"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.getUserDetails = getUserDetails;
exports.getDeviceToken = getDeviceToken;
function getUsers(req, res) {
    res.send("I am here");
}
function getUserById(req, res) {
    res.send('User details for ID: ' + req.params.userId);
}
function getUserDetails(req, res) { }
function getDeviceToken(req, res) { }
