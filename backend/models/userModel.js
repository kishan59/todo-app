import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required.'],
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        match: [/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please enter valid email.'],
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
    },
},
{
    timestamps: true
});


// hasing the password before saving it
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){   // if the password isn't modified then just next
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


// custom method to compare entered password with original saved password in db
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model('User', userSchema);

export default User;