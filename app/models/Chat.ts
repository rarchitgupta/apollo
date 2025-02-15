import mongoose, { Schema, model, Types } from "mongoose";
import { UserDocument } from "./User";

export interface ChatDocument {
  _id: string;
  userId: Types.ObjectId | UserDocument;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

const ChatSchema = new Schema<ChatDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "New Chat",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for querying chats by user and sorting by last message
ChatSchema.index({ userId: 1, lastMessageAt: -1 });

const Chat = mongoose.models?.Chat || model<ChatDocument>("Chat", ChatSchema);
export default Chat;
