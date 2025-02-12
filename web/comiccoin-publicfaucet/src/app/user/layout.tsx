// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/layout.tsx
import "../globals.css";
import AuthRequired from "@/components/AuthRequired";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRequired>
      <div className="min-h-screen">
        {/* Add your user layout components here */}
        {children}
      </div>
    </AuthRequired>
  );
}
