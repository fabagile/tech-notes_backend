const {Schema, model} = require('mongoose')

const userSch = new SchemaType({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: String,
        default: "Employee"
    }],
    active: {
        type: Boolean,
        default: true
    },
})


module.exports = model("User", userSch)