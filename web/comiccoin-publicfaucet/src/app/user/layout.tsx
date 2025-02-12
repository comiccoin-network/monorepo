// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/layout.tsx
import "../globals.css";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Add your user layout components here */}
      {children}
    </div>
  );
}
