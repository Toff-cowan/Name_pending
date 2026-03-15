import { Link } from "react-router";
import { MessageCircle } from "lucide-react";

export function ChatbotButton() {
  return (
    <Link
      to="/lab"
      aria-label="Open chat assistant"
      className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
    >
      <MessageCircle className="h-6 w-6 text-primary-foreground" />
    </Link>
  );
}
