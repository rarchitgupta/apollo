import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/use-toast";

export function useLogout() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  return { handleLogout };
}
