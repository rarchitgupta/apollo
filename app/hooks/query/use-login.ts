import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/use-toast";

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });

      if (response?.error) {
        throw new Error(response.error);
      }

      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You have successfully logged in.",
      });
      router.push("/");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    },
  });
}
