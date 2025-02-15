import mongoose from "mongoose";

// Message Content Schema
const contentPartSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "reasoning", "image", "file", "audio", "tool-call"],
    required: true,
  },
  text: String, // for text and reasoning
  image: String, // for image
  data: String, // for file
  mimeType: String, // for file
  audio: {
    // for audio
    data: String,
    format: {
      type: String,
      enum: ["mp3", "wav"],
    },
  },
  // Tool call specific fields
  toolCallId: String,
  toolName: String,
  args: mongoose.Schema.Types.Mixed,
  argsText: String,
  result: mongoose.Schema.Types.Mixed,
  isError: Boolean,
});

// Message Schema
const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: [contentPartSchema],
  parentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: {
      type: String,
      enum: ["running", "requires-action", "complete", "incomplete"],
    },
    reason: String,
    error: mongoose.Schema.Types.Mixed,
  },
  metadata: {
    unstable_annotations: [mongoose.Schema.Types.Mixed],
    unstable_data: [mongoose.Schema.Types.Mixed],
    steps: [mongoose.Schema.Types.Mixed],
    custom: mongoose.Schema.Types.Mixed,
  },
});

// Chat Schema
const chatSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, default: "New Chat" },
  headId: { type: String, default: null },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for user's chats
chatSchema.index({ userId: 1, createdAt: -1 });

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
