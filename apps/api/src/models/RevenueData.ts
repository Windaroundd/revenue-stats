import { Schema, model, type InferSchemaType } from "mongoose";

const revenueDataSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      required: true,
    },
    posRevenue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    eatclubRevenue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    labourCosts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalCovers: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    // Optional: Events that may impact revenue
    events: [
      {
        name: String,
        impact: {
          type: String,
          enum: ["positive", "negative"],
        },
      },
    ],
    // Week and year for easy filtering
    weekNumber: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
revenueDataSchema.index({ year: 1, weekNumber: 1, dayOfWeek: 1 });
revenueDataSchema.index({ date: 1 }, { unique: true });

// Virtual field for total revenue
revenueDataSchema.virtual("totalRevenue").get(function () {
  return this.posRevenue + this.eatclubRevenue;
});

// Ensure virtuals are included in JSON
revenueDataSchema.set("toJSON", { virtuals: true });
revenueDataSchema.set("toObject", { virtuals: true });

export type RevenueData = InferSchemaType<typeof revenueDataSchema> & {
  _id: string;
  totalRevenue: number;
};

export const RevenueDataModel = model("RevenueData", revenueDataSchema);
