const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

const User = require('../models/User')
const Note = require('../models/Note')

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users) {return res.status(400).json({message: 'No users found'})}
    res.json(users)
    // console.table

})

const createNewUser = asyncHandler(async (req, res) => {
    const {username, password, roles} = req.body
    // const user = {}
    // await User.create()
    // console.table

    // confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length)  {
        res.status(400).json({message: 'All fields are required.'})
    }

    // check for dups
    const dup = await User.findOne({username}).lean().exec()
    if(dup) {
        return res.status(409).json({message: 'Duplicate username'})
    }

    // hash password
    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = {username, "password": hashedPwd, roles}

    // create and store new user
    const user = await User.create(userObject)
    if(user) {
        res.status(201).json({message: `New user ${username} created`})
    } else {
        res.status(400).json({message: 'Invalid used data received'})
    }
    
})
const updateUser = asyncHandler(async (req, res) => {
    const {id, username, password, roles, active} = req.body

     // confirm data
     if(!username || !password || !Array.isArray(roles) || !roles.length || !id || typeof active  != 'boolean')  {
        res.status(400).json({message: 'All fields are required.'})
    }

    const user = await User.findById(id).exec()

    if(!user) {return res.status(400).json({message: 'User not found'})}
    
    const dup = await User.findOne({username}).lean().exec()
    if(dup && dup?._id.toString() != id) {
        return res.status(409).json({message: 'Duplicate username'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({message: `${updatedUser.username} updated`})
    
})
const deleteUser = asyncHandler(async (req, res) => {
    // await User.findByIdAndDelete()
    // console.table
})

module.exports = {createNewUser, getAllUsers, updateUser, deleteUser}