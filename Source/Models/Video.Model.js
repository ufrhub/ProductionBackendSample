import MONGOOSE, { Schema } from "mongoose";
import MONGOOSE_AGGREGATE_PAGINATE from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
    {
        videoFile: {
            type: String, // 
            required: [true, "Video File is required...!"],
        },
        thumbnail: {
            type: String,
            required: [true, "Thumbnail is required...!"],
        },
        title: {
            type: String,
            required: [true, "Title is required...!"],
        },
        description: {
            type: String,
            required: [true, "Description is required...!"],
        },
        owner: {
            type: Schema.Types.ObjectId,
            required: [true, "Owner is required...!"],
            ref: "User",
        },
        duration: {
            type: Number,
            required: [true, "Duration is required...!"],
        },
        views: {
            type: String,
            required: false,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

VideoSchema.plugin(MONGOOSE_AGGREGATE_PAGINATE);

export const Video = MONGOOSE.model("Videos", VideoSchema);
