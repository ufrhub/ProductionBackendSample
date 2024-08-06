import MONGOOSE, { Schema } from "mongoose";
import BCRYPT from "bcryptjs/dist/bcrypt";
import JSON_WEB_TOKEN from "jsonwebtoken";

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required...!"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required...!"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "Name is required...!"],
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // Cloudinary Url
            required: [true, "Avatar is required...!"],
        },
        coverImage: {
            type: String, // Cloudinary Url
            required: false,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                required: false,
                ref: "Video",
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required...!"],
        },
        refreshToken: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre("save", async function (Next) {
    if (!this.isModified("password")) return Next();

    const SaltRounds = 12;
    this.password = await BCRYPT.hash(this.password, SaltRounds);
    Next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await BCRYPT.compare(password, this.password);
}

export const User = MONGOOSE.model("Users", UserSchema);
