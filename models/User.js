import mongoose from "mongoose";

// ==========================================
// RECENT ACTIVITY SCHEMA
// ==========================================

const ActivitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      default: "quiz",
    },

    difficulty: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      default: 0,
    },

    coins: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);


// ==========================================
// ACTIVE COURSE SCHEMA
// ==========================================

const ActiveCourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Start Your Journey",
    },

    module: {
      type: Number,
      default: 1,
    },

    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);


// ==========================================
// PROGRESS SCHEMA
// ==========================================

const ProgressSchema = new mongoose.Schema(
  {
    // ======================================
    // CODING PROBLEMS
    // ======================================

    problemsSolved: {
      type: Number,
      default: 0,
    },

    totalProblems: {
      type: Number,
      default: 2419,
    },


    // ======================================
    // QUIZZES
    // ======================================

    quizAttempts: {
      type: Number,
      default: 0,
    },

    quizScoreTotal: {
      type: Number,
      default: 0,
    },

    quizScoreAvg: {
      type: Number,
      default: 0,
    },


    // ======================================
    // GLOBAL RANK
    // ======================================

    globalRank: {
      type: Number,
      default: 0,
    },


    // ======================================
    // COINS
    // ======================================

    coins: {
      type: Number,
      default: 0,
    },


    // ======================================
    // GAMIFICATION
    // ======================================

    streak: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },


    // ======================================
    // ACTIVE COURSE
    // ======================================

    activeCourse: {
      type: ActiveCourseSchema,
      default: () => ({}),
    },


    // ======================================
    // UNLOCKED TOPICS
    // ======================================

    unlockedTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],


    // ======================================
    // RECENT ACTIVITY
    // ======================================

    recentActivity: {
      type: [ActivitySchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);


// ==========================================
// USER SCHEMA
// ==========================================

const UserSchema = new mongoose.Schema(
  {
    // ======================================
    // USERNAME
    // ======================================

    username: {
      type: String,
      required: true,
      trim: true,
    },


    // ======================================
    // EMAIL
    // ======================================

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },


    // ======================================
    // PASSWORD
    // ======================================

    password: {
      type: String,
      required: true,
    },


    // ======================================
    // EMAIL VERIFICATION
    // ======================================

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },


    // ======================================
    // PRIMARY LANGUAGE
    // ======================================

    primaryLanguage: {
      type: String,
      default: null,
    },


    // ======================================
    // USER PROGRESS
    // ======================================

    progress: {
      type: ProgressSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// EXPORT MODEL
// ==========================================

const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;