import mongoose, { Schema, model, Types } from "mongoose";
import { UserDocument } from "./User";
import { ChatDocument } from "./Chat";

export interface MessageDocument {
  _id: string;
  chatId: Types.ObjectId | ChatDocument;
  userId: Types.ObjectId | UserDocument;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient message retrieval by chat
MessageSchema.index({ chatId: 1, createdAt: 1 });

// Update the lastMessageAt field in the Chat model whenever a new message is created
MessageSchema.pre("save", async function (next) {
  if (this.isNew) {
    await mongoose
      .model("Chat")
      .findByIdAndUpdate(this.chatId, { lastMessageAt: this.createdAt });
  }
  next();
});

const Message =
  mongoose.models?.Message || model<MessageDocument>("Message", MessageSchema);
export default Message;
