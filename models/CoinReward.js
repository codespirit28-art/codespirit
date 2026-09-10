import mongoose from "mongoose";

const CoinRewardSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      coins: {
        type: Number,
        required: true,
        min: 0,
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

CoinRewardSchema.index(
  {
    userId: 1,
    questionId: 1,
  },
  {
    unique: true,
  }
);

export default
  mongoose.models.CoinReward ||
  mongoose.model(
    "CoinReward",
    CoinRewardSchema
  );
