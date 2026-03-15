import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  // Validate the input
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the user already registered
    const isAlreadyRegistered = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (isAlreadyRegistered) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Create a new user
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
      },
      config.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getUser(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: token not found" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
}
export { registerUser, getUser };
