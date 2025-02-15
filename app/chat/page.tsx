import { redirect } from "next/navigation";
import { createChat } from "@/app/lib/chat-store";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/app/models/User";
import { connectDB } from "@/lib/mongodb";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Connect to DB and get user
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    redirect("/login");
  }

  // Create a new chat with the user's ID
  const id = await createChat(user._id.toString());
  redirect(`/chat/${id}`);
}
