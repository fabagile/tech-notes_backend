const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Note = require("../models/Note");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
  // console.table
});

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    res.status(400).json({ message: "All fields are required." });
  }

  // check for dupes
  const dupe = await User.findOne({ username }).lean().exec();
  if (dupe) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // hash password
  const hashedPwd = await bcrypt.hash(password, 10);

  const userObject = { username, password: hashedPwd, roles };

  // create and store new user
  const user = await User.create(userObject);
  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid used data received" });
  }
});
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, roles, active } = req.body;

  const datafieldErrorMessage = (cond, message) => {
    if (cond) return res.status(400).json({ message: message });
  };

  // confirm data
  datafieldErrorMessage(
    !username ||
      !password ||
      !Array.isArray(roles) ||
      !roles.length ||
      !id ||
      typeof active !== "boolean",
    "All fields are required."
  );
  // }

  const user = await User.findById(id).exec();

  datafieldErrorMessage(!user, "User not found");

  const dupe = await User.findOne({ username }).lean().exec();
  if (dupe && dupe?._id.toString() != id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});
const deleteUser = asyncHandler(async (req, res) => {
  const datafieldErrorMessage = (cond, message) => {
    if (cond) return res.status(400).json({ message: message });
  };
  const { id } = req.body;
  datafieldErrorMessage(!id, "User ID required");

  const notes = await Note.findOne({ user: id }).lean().exec();
  datafieldErrorMessage(notes?.length, "User has assigned notes");

  const user = await User.findById(id).exec();

  datafieldErrorMessage(!user, "User not found");

  const result = await user.deleteOne();

  const reply = `User with username ${result.username} and ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = { createNewUser, getAllUsers, updateUser, deleteUser };
