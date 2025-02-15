import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/use-toast";
import { register } from "@/app/actions/register";

interface SignupCredentials {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  name: FormDataEntryValue | null;
}

export function useSignup() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const response = await register(credentials);

      if (response?.error) {
        throw new Error(response.error);
      }

      return response;
    },
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "You can now login with your credentials",
      });
      router.push("/login");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    },
  });
}
