// models/Job.js

import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    // Core job info
    name: {
      type: String,
      required: [true, "Job name is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    backend: {
      type: String,
      required: [true, "Backend selection is required"],
    },
    circuitType: {
      type: String,
      required: true,
      enum: ["estimator", "sampler"],
      default: "sampler",
    },
    shots: {
      type: Number,
      required: true,
      default: 1024,
      min: 1,
    },
    rawQASM: {
      type: String,
      required: [true, "QASM code is required"],
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },

    // NEW – multi-step UI extra info (optional)
    algorithm: { type: String, default: null },
    oracleType: { type: String, default: null },
    runMode: {
      type: String,
      enum: ["hardware", "simulator"],
      default: "hardware",
    },

    // Status & IBM integration
    status: {
      type: String,
      required: true,
      enum: ["pending", "queued", "running", "completed", "failed", "cancelled"],
      default: "pending",
    },
    ibmJobId: String,

    // Circuit metrics
    qubits: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },

    // IBM Job result (filled by worker)
    ibmResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    runtimeInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    failureInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    validationInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    transpiledDepth: {
      type: Number,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    retryHistory: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ user: 1, status: 1 });

export default mongoose.model("Job", JobSchema);
