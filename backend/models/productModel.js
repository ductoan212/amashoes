import mongoose from 'mongoose';

const reviewShema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    comment: { type: String, require: true },
    rating: { type: Number, require: true },
  },
  {
    timestamps: true,
  }
);

const productShema = new mongoose.Schema(
  {
    name: { type: String, require: true, unique: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    image: { type: String, require: true },
    brand: { type: String, require: true },
    category: { type: String, require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    countInStock: { type: Number, require: true },
    rating: { type: Number, require: true },
    numReviews: { type: Number, require: true },
    reviews: [reviewShema],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productShema);
export default Product;
