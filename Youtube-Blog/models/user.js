const { createHmac, randomBytes } = require("node:crypto");
const { Schema, model } = require('mongoose');
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
        // required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: "/images/userimage.png",
    },
    role: {
        type: String, 
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
},{timeStamp: true})

userSchema.static('matchPasswordAndGenerateToken', async function(email, password) {
    const user = await this.findOne({email});
    if(!user) throw new Error("User not found");
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");
    console.log(hashedPassword==userProvidedHash);
    console.log(userProvidedHash)
    if(hashedPassword !== userProvidedHash) throw new Error("Incorrect password")
    // return user;
    const token = createTokenForUser(user);
    return token;
})

userSchema.pre('save', function (next) {
    const user = this;
    if(!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest("hex");
    this.salt=salt;
    this.password=hashedPassword;
    next();
})




const User = model("user", userSchema);

module.exports = User;