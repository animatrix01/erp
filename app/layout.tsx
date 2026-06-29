import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/hooks/use-role";
import { Sidebar } from "@/components/custom/sidebar";
import { Header } from "@/components/custom/header";

export const metadata: Metadata = {
  title: "Employee Profile Management - College ERP",
  description: "Institutional Employee Profile Management Module",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <RoleProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
                {children}
              </main>
            </div>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
