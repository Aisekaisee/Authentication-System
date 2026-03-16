import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../models/session.model.js";

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

    /*
    Single token approach:
      const token = jwt.sign(
      {
        id: newUser._id,
      },
      config.JWT_SECRET,
      { expiresIn: "1d" },
      );
    */

    // Access token and refresh token approach:

    const refreshToken = jwt.sign(
      {
        id: newUser._id,
      },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const session = await Session.create({
      user: newUser._id,
      refreshTokenHash: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
      {
        id: newUser._id,
        sessionId: session._id,
      },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
      },
      accessToken,
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

async function refreshToken(req,res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized: refresh token not found" });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await Session.findOne({ user: decoded.id, refreshTokenHash: refreshTokenHash });

    if (!session || session.revoked) {
      return res.status(401).json({ message: "Unauthorized: invalid refresh token" });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    // Optionally, you can also issue a new refresh token here,purely for security reasons, but it's not mandatory. If you do, make sure to invalidate the old refresh token.
    const newRefreshToken = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    // Update the session with the new refresh token hash
    session.refreshTokenHash = newRefreshTokenHash;
    await session.save(); 

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
}

async function logoutUser(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not found" });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await Session.findOneAndUpdate(
      { user: decoded.id, refreshTokenHash: refreshTokenHash },
      { revoked: true }
    );

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export { registerUser, getUser,refreshToken, logoutUser }; 
