import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    // Free or paid topic
    isFree: {
      type: Boolean,
      default: true,
    },

    // Coins required for paid topic
    unlockCost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Topic =
  mongoose.models.Topic ||
  mongoose.model("Topic", TopicSchema);

export default Topic;