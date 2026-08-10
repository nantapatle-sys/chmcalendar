import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Official Duty Travel Log - CHM",
  description: "Official Activity Calendar and Duty Travel Log - College of Hospitality Industry Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
