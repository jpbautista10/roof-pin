import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      richColors
      duration={4000}
      toastOptions={{
        style: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.06)",
          fontSize: "14px",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
