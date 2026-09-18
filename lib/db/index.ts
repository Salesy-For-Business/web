export { connectDb } from "@/lib/db/connect";
export {
  User,
  type IUser,
  type UserDocument,
  type UserLean,
} from "@/lib/db/models/user";
export {
  Business,
  type IBusiness,
  type BusinessDocument,
  type BusinessLean,
} from "@/lib/db/models/business";
export { Otp, type IOtp, type OtpDocument } from "@/lib/db/models/otp";
export {
  Product,
  type IProduct,
  type ProductDocument,
  type ProductLean,
} from "@/lib/db/models/product";
export {
  Order,
  type IOrder,
  type IOrderItem,
  type OrderDocument,
  type OrderLean,
  type OrderStatus,
  type OrderChannel,
} from "@/lib/db/models/order";
export {
  Review,
  type IReview,
  type ReviewDocument,
  type ReviewLean,
} from "@/lib/db/models/review";
