import "./globals.css";

import { cn } from "@/lib/utils";
import { Montserrat } from "next/font/google";
import { MyRuntimeProvider } from "./MyRuntimeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider } from "antd";
const montserrat = Montserrat({ subsets: ["latin"] });
import zhCN from "antd/locale/zh_CN";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MyRuntimeProvider>
      <html lang="en">
        <body className={cn(montserrat.className, "h-dvh")}>
          <ConfigProvider locale={zhCN}>
            <AntdRegistry>{children}</AntdRegistry>
          </ConfigProvider>
          {/* {children} */}
        </body>
      </html>
    </MyRuntimeProvider>
  );
}
