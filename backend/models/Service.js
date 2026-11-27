import mongoose from "mongoose";

// Sub-schema for Benefits
const benefitSchema = new mongoose.Schema({
  icon: { type: String }, // We'll store the icon name as a string (e.g., "Flame")
  title: { type: String, required: true },
  desc: { type: String, required: true },
});

// Sub-schema for Process Steps
const processSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
});

// Sub-schema for Reviews
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: true },
});

// Sub-schema for FAQs
const faqSchema = new mongoose.Schema({
  q: { type: String, required: true },
  a: { type: String, required: true },
});

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // e.g., "sauna"
    title: { type: String, required: true },
    shortTitle: { type: String, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ["Heat", "Cold", "Recovery Tech", "Bathing", "Bodywork", "Amenity"] 
    },
    tagline: { type: String, required: true },
    duration: { type: String, required: true }, 
    price: { type: Number, required: true },    
    capacity: { type: String, required: true },
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    heroImage: { type: String, required: true },
    intro: { type: String, required: true },
    
    // Rich Data Arrays
    overview: [{ type: String }],
    included: [{ type: String }],
    gallery: [{ type: String }], // Array of image URLs
    related: [{ type: String }], // Array of slugs (e.g., "cold-plunge")
    
    // Array of Objects
    benefits: [benefitSchema],
    process: [processSchema],
    reviews_list: [reviewSchema],
    faqs: [faqSchema],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;