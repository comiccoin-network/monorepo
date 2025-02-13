// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user-initialization/layout.tsx
import { AuthProvider } from "@/components/AuthProvider";

export default function UserInitializationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
