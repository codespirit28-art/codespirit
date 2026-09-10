import mongoose from "mongoose";

const theorySchema = new mongoose.Schema(
  {
    mainTopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    blocks: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Theory =
  mongoose.models.Theory ||
  mongoose.model("Theory", theorySchema);

export default Theory;
