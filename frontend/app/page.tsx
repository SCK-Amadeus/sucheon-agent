"use client";

import { Thread } from "@assistant-ui/react";
import { PriceSnapshotTool } from "@/components/tools/price-snapshot/PriceSnapshotTool";
import { PurchaseStockTool } from "@/components/tools/purchase-stock/PurchaseStockTool";
import { ToolFallback } from "@/components/tools/ToolFallback";
import { makeMarkdownText } from "@assistant-ui/react-markdown";

const MarkdownText = makeMarkdownText({});

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      <Thread
        welcome={{
          message:
            "您好，我是九畴，一个工业智能体，能帮您进行运维智能决策、故障根因分析、全景自动化报告、AI质检等，希望能成为您得力的工业智能助手。请告诉我您需要什么帮助？",
        }}
        assistantAvatar={{
          fallback: "九畴",
        }}
        assistantMessage={{ components: { Text: MarkdownText, ToolFallback } }}
        tools={[PriceSnapshotTool, PurchaseStockTool]}
      />
    </div>
  );
}
