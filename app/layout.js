import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "./Components/navbar.js"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Rate My Professor",
  description: "Application to help you find your perfect professor",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
