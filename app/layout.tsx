import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Resolve",
  description: "Review and resolve customer complaints.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="brand">Resolve</header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
