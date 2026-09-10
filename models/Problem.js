import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      default: "",
    },

    expectedOutput: {
      type: String,
      default: "",
    },

    hidden: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    languages: {
      type: [String],
      default: [],
    },

    points: {
      type: Number,
      default: 10,
    },

    inputFormat: {
      type: String,
      default: "",
    },

    outputFormat: {
      type: String,
      default: "",
    },

    constraints: {
      type: String,
      default: "",
    },

    starterCode: {
      type: Map,
      of: String,
      default: {},
    },

    testCases: {
      type: [testCaseSchema],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Problem ||
  mongoose.model("Problem", problemSchema);