"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.logout = logout;
function signup(req, res) {
    // * Destructure request body
    const { firstName, lastName, username, email, phoneNumber, password, userType, organisationName, } = req.body;
    try {
        // * If the user is a dancer
        if (userType == "dancer") {
        }
        // * If the user is a client
        else if (userType == "client") {
        }
    }
    catch (error) { }
}
function login(req, res) { }
function logout(req, res) { }
