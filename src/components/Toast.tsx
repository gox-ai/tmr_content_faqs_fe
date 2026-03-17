import toast from "react-hot-toast";

type ToastType = "success" | "error" | "warning" | "info";

export function useToast() {
  return {
    showToast: (type: ToastType, message: string) => {
      if (type === "success") toast.success(message);
      else if (type === "error") toast.error(message);
      else toast(message);
    },
  };
}
