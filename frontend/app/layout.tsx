import "./globals.css";

import { cn } from "@/lib/utils";
import { Montserrat } from "next/font/google";
import { MyRuntimeProvider } from "./MyRuntimeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
const montserrat = Montserrat({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MyRuntimeProvider>
      <html lang="en">
        <body className={cn(montserrat.className, "h-dvh")}>
          <AntdRegistry>{children}</AntdRegistry>
          {/* {children} */}
        </body>
      </html>
    </MyRuntimeProvider>
  );
}
