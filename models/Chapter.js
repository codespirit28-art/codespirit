import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // THEORY CONTENT
    // =====================================================

    theory: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Chapter =
  mongoose.models.Chapter ||
  mongoose.model("Chapter", chapterSchema);

export default Chapter;