import { openai } from "@ai-sdk/openai";
import { appendResponseMessages, streamText, appendClientMessage } from "ai";
import { saveChat, loadChat } from "@/app/lib/chat-store";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/app/models/User";
import { connectDB } from "@/lib/mongodb";
import { Types } from "mongoose";

interface UserIdOnly {
  _id: Types.ObjectId;
}

export const maxDuration = 30;
// Limit the number of messages to load for context
const MAX_MESSAGES_LOAD = 50;

export async function POST(req: Request) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Connect to DB if not already connected
    await connectDB();

    // Get the user from database - add projection to only get _id
    const user = await User.findOne(
      { email: session.user.email },
      { _id: 1 },
    ).lean<UserIdOnly>();

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Get request data
    const { id, messages: initialMessages } = await req.json();
    let messages = initialMessages;

    // If we're only receiving the last message, load recent messages for context
    if (messages.length === 1) {
      const previousMessages = await loadChat(id, MAX_MESSAGES_LOAD);
      messages = appendClientMessage({
        messages: previousMessages,
        message: messages[0],
      });
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
      async onFinish({ response }) {
        // Save the complete conversation including the AI's response
        // We don't need to await this as it's not critical for the response
        saveChat({
          id,
          messages: appendResponseMessages({
            messages,
            responseMessages: response.messages,
          }),
          userId: user._id.toString(),
        }).catch((error) => console.error("Error saving chat:", error));
      },
    });

    // Handle client disconnects by consuming the stream
    // Don't await to prevent holding server resources
    result.consumeStream();

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during chat processing" }),
      { status: 500 },
    );
  }
}
