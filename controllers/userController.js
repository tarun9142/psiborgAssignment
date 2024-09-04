const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { sendEmailNotification } = require('../services/notificationService');

const User = require("../models/User");
const Team = require('../models/Team');

const BlacklistedToken = require("../models/BlacklistedToken");

// Register User
exports.registerUser = async (req, res) => {
  const { username, email, password, number } = req.body;

  try {

    if(!username,!email,!password,!number){
      return res.status(400).json({ error: "All fields are required" });
    }
    // Use validator's isEmail function
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Custom password validation function
    const isStrongPassword = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (!isStrongPassword) {
      return res.status(400).json({ error: "Password is not strong enough" });
    }

    if (!validator.isMobilePhone(number, 'any', { strictMode: true })) {
      return res.status(400).json({ error: 'Invalid mobile number format. Country code required e.g +91' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    const existingNumber = await User.findOne({ number });
    if (existingNumber)
      return res.status(400).json({ message: "Number already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      number,
    });
    await newUser.save();

    // send a confirmation email
    try {
      sendEmailNotification(email, 'Confirm Email', `confirm email by clicking the following link.( coming soon....)`);
    } catch (error) {
      
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user.id, username: user.username, roles: user.roles };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Logout User Controller
exports.logoutUser = async (req, res) => {
  try {
    // Get the JWT token from the request header
    const token = req.header("Authorization").replace("Bearer ", "");

    // Save the token to the blacklist
    const blacklistedTokens = new BlacklistedToken({ token });
    await blacklistedTokens.save();

    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'A team with this name already exists.' });
    }
    // Check if the manager is valid
    const manager = await User.findById(req.user.id);


    // Create the team
    const newTeam = await Team.create({ name, manager: req.user.id });

    // Update manager to be part of the team
    manager.team = newTeam._id;
    await manager.save();

    res.status(201).json(newTeam);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

// Add a member to a team
exports.addMemberToTeam = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);
    const user = await User.findById(userId);

    if (!team || !user) {
      return res.status(404).json({ message: 'Team or User not found.' });
    }

    if (!team.manager.equals(req.user.id) && !req.user.roles.includes("Admin")) {
      return res.status(403).json({ message: 'You can only add members to your own team.' });
    }

    // Ensure user is not already in a team
    if (user.team) {
      return res.status(400).json({ message: 'User is already in a team.' });
    }

    // Add user to the team
    team.members.push(userId);
    user.team = teamId;

    await team.save();
    await user.save();

    res.status(200).json({ message: 'User added to the team.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all members grouped by team name managed by a manager
exports.getTeamMembers = async (req, res) => {
  try {
    const managerId = req.user._id; // Assuming req.user is populated by the auth middleware

    // Find all teams managed by the authenticated manager
    const teams = await Team.find({ manager: managerId }).populate('members');

    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: 'No teams found for this manager.' });
    }

    // Create an object to group members by team name
    const membersByTeam = teams.map(team => ({
      teamName: team.name,
      members: team.members,
    }));

    res.status(200).json({ teams: membersByTeam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Endpoint to update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { preference } = req.body;
    const userId = req.user._id; // Assuming you have user authentication middleware

    // Validate preference
    if (!["email", "sms"].includes(preference)) {
      return res
        .status(400)
        .json({ message: "Invalid notification preference" });
    }

    // Update the user's notification preferences
    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preference },
      { new: true }
    );

    res.status(200).json({ message: "Notification preferences updated", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating notification preferences", error });
  }
};
