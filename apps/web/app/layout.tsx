import "./globals.css";
export const metadata = { title: "Bible Platform", description: "Read. Study. Pray. Grow." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
