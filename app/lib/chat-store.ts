import { Message as VercelMessage } from "ai";
import { Types } from "mongoose";
import Chat from "../models/Chat";
import Message, { MessageDocument } from "../models/Message";

interface MessageId {
  _id: Types.ObjectId;
}

// Helper to convert our MongoDB message to Vercel AI SDK message format
function convertToVercelMessage(message: MessageDocument): VercelMessage {
  return {
    id: message._id.toString(),
    content: message.content,
    role: message.role,
    createdAt: message.createdAt,
  };
}

// Helper to convert Vercel AI SDK message to our MongoDB format
function convertToMongoMessage(
  message: VercelMessage,
  chatId: string,
  userId: string,
) {
  return {
    content: message.content,
    role: message.role,
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userId),
  };
}

export async function createChat(
  userId: string,
  title: string = "New Chat",
): Promise<string> {
  const chat = await Chat.create({
    userId: new Types.ObjectId(userId),
    title,
  });
  return chat._id.toString();
}

export async function loadChat(
  chatId: string,
  limit: number = 100,
): Promise<VercelMessage[]> {
  const messages = await Message.find({ chatId: new Types.ObjectId(chatId) })
    .sort({ createdAt: -1 }) // Sort by newest first
    .limit(limit) // Limit the number of messages
    .lean<MessageDocument[]>();

  // Reverse to get chronological order
  return messages.reverse().map(convertToVercelMessage);
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: VercelMessage[];
  userId: string;
}): Promise<void> {
  const chatId = new Types.ObjectId(id);
  const userObjectId = new Types.ObjectId(userId);

  // Verify chat exists and belongs to user - use projection for efficiency
  const chat = await Chat.findOne(
    { _id: chatId, userId: userObjectId },
    { _id: 1 },
  ).lean();

  if (!chat) {
    throw new Error("Chat not found or access denied");
  }

  // Get only IDs of existing messages for comparison
  const existingMessageIds = await Message.find({ chatId }, { _id: 1 }).lean<
    MessageId[]
  >();

  // Find new messages that need to be saved
  const existingIds = new Set(existingMessageIds.map((m) => m._id.toString()));
  const newMessages = messages.filter((m) => !existingIds.has(m.id));

  // Batch insert new messages if any
  if (newMessages.length > 0) {
    await Message.insertMany(
      newMessages.map((message) => convertToMongoMessage(message, id, userId)),
    );

    // Update chat's lastMessageAt
    await Chat.updateOne({ _id: chatId }, { lastMessageAt: new Date() });
  }
}

export async function getUserChats(
  userId: string,
  limit: number = 10,
  offset: number = 0,
) {
  return Chat.find({ userId: new Types.ObjectId(userId) })
    .sort({ lastMessageAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
}

export async function deleteChat(
  chatId: string,
  userId: string,
): Promise<void> {
  const chat = await Chat.findOneAndDelete({
    _id: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userId),
  });

  if (!chat) {
    throw new Error("Chat not found or access denied");
  }

  // Delete all messages in background
  Message.deleteMany({ chatId: new Types.ObjectId(chatId) }).catch((error) =>
    console.error("Error deleting messages:", error),
  );
}
