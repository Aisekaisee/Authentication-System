import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

async function registerUser(req,res) {
    const { username, email, password } = req.body;

    // Validate the input
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if the user already registered
        const isAlreadyRegistered = await userModel.findOne({
            $or: [{ username }, { email }]
        });
        if (isAlreadyRegistered) {
            return res.status(400).json({ message: "User already registered" });
        }

        // Create a new user
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        
        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        const token = jwt.sign({
            id: newUser._id
        }, config.JWT_SECRET,{expiresIn: "1h"});

        res.status(201).json({ 
            message: "User registered successfully",
            user:{ 
                username: newUser.username,
                email: newUser.email
            },
            token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export { 
    registerUser,
};