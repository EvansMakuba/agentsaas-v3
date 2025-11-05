import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: String,
    message: String,
    isRead: { type: Boolean, default: false},
    timestamp: { type: Date, default: Date.now},
    type: String
});
export default mongoose.model("Notification", notificationSchema);
