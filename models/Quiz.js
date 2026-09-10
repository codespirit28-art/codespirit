import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
    },

    correct: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const ExampleSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      default: "",
    },

    output: {
      type: String,
      default: "",
    },

    explanation: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const TestCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      default: "",
    },

    output: {
      type: String,
      default: "",
    },

    explanation: {
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

const StarterCodeSchema = new mongoose.Schema(
  {
    javascript: {
      type: String,
      default: "",
    },

    python: {
      type: String,
      default: "",
    },

    java: {
      type: String,
      default: "",
    },

    cpp: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "mcq",
        "multiple",
        "coding",
      ],
      default: "mcq",
    },

    clientId: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      default: "",
    },

    statement: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      enum: [
        "Easy",
        "Medium",
        "Hard",
      ],
      default: "Easy",
    },

    marks: {
      type: Number,
      default: 1,
      min: 0,
    },

    /*
     * Coins awarded for solving this question.
     */
    coins: {
      type: Number,
      default: 0,
      min: 0,
    },

    negativeMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    tags: {
      type: [String],
      default: [],
    },

    options: {
      type: [OptionSchema],
      default: [],
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

    examples: {
      type: [ExampleSchema],
      default: [],
    },

    starterCode: {
      type: StarterCodeSchema,
      default: () => ({}),
    },

    language: {
      type: String,
      enum: [
        "javascript",
        "python",
        "java",
        "cpp",
      ],
      default: "java",
    },

    testCases: {
      type: [TestCaseSchema],
      default: [],
    },

    explanation: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const QuizSchema = new mongoose.Schema(
  {
    mainTopicId: {
      type: mongoose.Schema.Types.ObjectId,
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
    },

    difficulty: {
      type: String,
      default: "Easy",
    },

    duration: {
      type: Number,
      default: 30,
    },

    totalMarks: {
      type: Number,
      default: 0,
    },

    questionCount: {
      type: Number,
      default: 0,
    },

    questions: {
      type: [QuestionSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

export default
  mongoose.models.Quiz ||
  mongoose.model("Quiz", QuizSchema);
