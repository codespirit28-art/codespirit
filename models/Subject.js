import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Subject ||
  mongoose.model("Subject", SubjectSchema);