/*********************
 * Import Required Modules and Packages.
 * - MONGOOSE: Mongoose library for MongoDB interaction.
 * - Schema: Schema constructor from Mongoose for defining the structure of documents.
 * - MONGOOSE_AGGREGATE_PAGINATE: Plugin for Mongoose to add pagination capability to aggregate queries.
 *********************/
import MONGOOSE, { Schema } from "mongoose";
import MONGOOSE_AGGREGATE_PAGINATE from "mongoose-aggregate-paginate-v2";

/*********************
 * Define the Video Schema.
 * - VIDEO_SCHEMA: Mongoose schema to define the structure of Video documents in MongoDB.
 * - videoFile: URL or path to the video file.
 * - thumbnail: URL or path to the video thumbnail.
 * - title: Title of the video.
 * - description: Description of the video.
 * - owner: Reference to the User who uploaded the video.
 * - duration: Duration of the video in seconds.
 * - views: Number of views the video has received. Defaults to 0.
 * - isPublished: Boolean flag indicating whether the video is published. Defaults to true.
 *********************/
const VIDEO_SCHEMA = new Schema(
    {
        videoFile: {
            type: String, // URL or path to the video file. 
            required: [true, "Video File is required...!"],
        },
        thumbnail: {
            type: String, // URL or path to the video thumbnail.
            required: [true, "Thumbnail is required...!"],
        },
        title: {
            type: String, // Title of the video.
            required: [true, "Title is required...!"],
        },
        description: {
            type: String, // Description of the video.
            required: [true, "Description is required...!"],
        },
        owner: {
            type: Schema.Types.ObjectId, // Reference to the User who uploaded the video.
            required: [true, "Owner is required...!"],
            ref: "Users", // This refers to the "Users" model.
        },
        duration: {
            type: Number, // Duration of the video in seconds.
            required: [true, "Duration is required...!"],
        },
        views: {
            type: Number, // Number of views the video has received.
            required: false,
            default: 0, // Defaults to 0.
        },
        isPublished: {
            type: Boolean, // Boolean flag indicating whether the video is published.
            default: true, // Defaults to true.
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt fields.
    }
);

/*********************
 * Apply the Aggregate Paginate Plugin to the Video Schema.
 * - This adds pagination capabilities to aggregate queries on the Video model.
 *********************/
VIDEO_SCHEMA.plugin(MONGOOSE_AGGREGATE_PAGINATE);

/*********************
 * Create and Export the Video Model.
 * - VIDEO: Mongoose model for the Video schema.
 * - The model is exported so that it can be used to interact with the Videos collection in the MongoDB database.
 * - MONGOOSE.model("Videos", VIDEO_SCHEMA) creates a model named "Videos" based on the VIDEO_SCHEMA schema.
 * - This model allows CRUD operations and queries on the "Videos" collection in MongoDB.
 *********************/
export const VIDEO = MONGOOSE.model("Videos", VIDEO_SCHEMA);
