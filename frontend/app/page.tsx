"use client";

import { Thread } from "@/components/assistant-ui/thread";
// import { Thread } from "@assistant-ui/react";
import { PriceSnapshotTool } from "@/components/tools/price-snapshot/PriceSnapshotTool";
import { PurchaseStockTool } from "@/components/tools/purchase-stock/PurchaseStockTool";
import { ToolFallback } from "@/components/tools/ToolFallback";
// import { ThreadList } from "@assistant-ui/react";
import {
  makeMarkdownText,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "antd";
import { X } from "lucide-react";
import { ThreadListContext } from "./MyRuntimeProvider";
import ReactMarkdown from "react-markdown";
import classNames from "classnames";
import remarkGfm from "remark-gfm";

const MarkdownText = makeMarkdownText({});

export const ListContext = createContext({
  isShowList: true,
  setIsShowList: (v: boolean) => {},
});

export const ReportContext = createContext<{
  reportUrl: string;
  setReportUrl: (report: string) => void;
  isShowReport: boolean;
  setIsShowReport: (isShowReport: boolean) => void;
  setMarkdownText: (markdownText: string) => void;
  setReportType: (reportType: "iframe" | "markdown") => void;
}>({
  reportUrl: "",
  setReportUrl: (v: string) => {},
  isShowReport: false,
  setIsShowReport: (v: boolean) => {},
  setMarkdownText: (v: string) => {},
  setReportType: (v: "iframe" | "markdown") => {},
});
export default function Home() {
  const [reportUrl, setReportUrl] = useState("");
  const [isShowReport, setIsShowReport] = useState(false);
  const [isShowList, setIsShowList] = useState(true);
  const [reportType, setReportType] = useState<"iframe" | "markdown">("iframe");
  const [markdownText, setMarkdownText] = useState<string>("");
  const { activeThreadId } = useContext(ThreadListContext);
  const gridCols = useMemo(() => {
    if (isShowReport) {
      return isShowList
        ? "grid-cols-list-thread-report"
        : "grid-cols-thread-report";
    }
    return isShowList ? "grid-cols-list-thread" : "grid-cols-thread";
  }, [isShowList, isShowReport]);
  useEffect(() => {
    setIsShowReport(false);
  }, [activeThreadId]);
  useEffect(() => {
    if (reportUrl) {
      const url = new URL(reportUrl);
      if (url.searchParams.has("data")) {
        setReportType("markdown");
        setMarkdownText(decodeURIComponent(url.searchParams.get("data") ?? ""));
      } else {
        setReportType("iframe");
        setReportUrl(url.href);
      }
    }
  }, [reportUrl]);
  return (
    <ReportContext.Provider
      value={{
        reportUrl,
        setReportUrl: setReportUrl,
        isShowReport,
        setIsShowReport,
        setMarkdownText,
        setReportType,
      }}
    >
      <div
        className={`transition-all duration-300 grid h-full ${gridCols}`}
        // ${isShowReport ? `grid-cols-[${isShowList ? "200px_" : ""}1fr_max(400px,20%)]` : `grid-cols-[${isShowList ? "200px_" : "0fr_"}1fr]`}`
      >
        {/* <Thread
        welcome={{
          message:
            "您好，我是九畴，一个工业智能体，能帮您进行运维智能决策、故障根因分析、全景自动化报告、AI质检等，希望能成为您得力的工业智能助手。请告诉我您需要什么帮助？",
        }}
        assistantAvatar={{
          fallback: "九畴",
        }}
        assistantMessage={{ components: { Text: MarkdownText, ToolFallback } }}
        tools={[PriceSnapshotTool, PurchaseStockTool]}
      /> */}
        <ListContext.Provider value={{ isShowList, setIsShowList }}>
          <div
            className={`transition-all h-full duration-300 overflow-hidden
              `}
          >
            <ThreadList />
          </div>
        </ListContext.Provider>

        <Thread />
        {isShowReport && (
          <div className="flex h-full flex-col bg-[rgb(249,250,251)]">
            <div className="flex  p-4 bg-[rgb(249,250,251)]">
              <div className="text-lg font-bold">Agent工作台</div>
              <div
                className="ml-auto cursor-pointer"
                onClick={() => setIsShowReport(false)}
              >
                <X className="size-6 " />
              </div>
            </div>
            {reportType === "iframe" ? (
              <iframe
                src={reportUrl}
                className="h-full w-full"
                title="report"
              />
            ) : (
              <div className="w-full grow overflow-y-auto p-4 ">
                <div className="min-h-full bg-[rgb(243,243,243)]  p-4 overflow-y-auto max-h-[calc(100vh-200px)]  rounded-md">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, className, ...props }) => (
                        <h1
                          className={classNames("aui-md-h1", className)}
                          {...props}
                        />
                      ),
                      h2: ({ node, className, ...props }) => (
                        <h2
                          className={classNames("aui-md-h2", className)}
                          {...props}
                        />
                      ),
                      h3: ({ node, className, ...props }) => (
                        <h3
                          className={classNames("aui-md-h3", className)}
                          {...props}
                        />
                      ),
                      h4: ({ node, className, ...props }) => (
                        <h4
                          className={classNames("aui-md-h4", className)}
                          {...props}
                        />
                      ),
                      h5: ({ node, className, ...props }) => (
                        <h5
                          className={classNames("aui-md-h5", className)}
                          {...props}
                        />
                      ),
                      h6: ({ node, className, ...props }) => (
                        <h6
                          className={classNames("aui-md-h6", className)}
                          {...props}
                        />
                      ),
                      p: ({ node, className, ...props }) => (
                        <p
                          className={classNames("aui-md-p", className)}
                          {...props}
                        />
                      ),
                      a: ({ node, className, ...props }) => (
                        <a
                          className={classNames("aui-md-a", className)}
                          {...props}
                        />
                      ),
                      blockquote: ({ node, className, ...props }) => (
                        <blockquote
                          className={classNames("aui-md-blockquote", className)}
                          {...props}
                        />
                      ),
                      ul: ({ node, className, ...props }) => (
                        <ul
                          className={classNames("aui-md-ul", className)}
                          {...props}
                        />
                      ),
                      ol: ({ node, className, ...props }) => (
                        <ol
                          className={classNames("aui-md-ol", className)}
                          {...props}
                        />
                      ),
                      hr: ({ node, className, ...props }) => (
                        <hr
                          className={classNames("aui-md-hr", className)}
                          {...props}
                        />
                      ),
                      table: ({ node, className, ...props }) => (
                        <table
                          className={classNames("aui-md-table", className)}
                          {...props}
                        />
                      ),
                      th: ({ node, className, ...props }) => (
                        <th
                          className={classNames("aui-md-th", className)}
                          {...props}
                        />
                      ),
                      td: ({ node, className, ...props }) => (
                        <td
                          className={classNames("aui-md-td", className)}
                          {...props}
                        />
                      ),
                      tr: ({ node, className, ...props }) => (
                        <tr
                          className={classNames("aui-md-tr", className)}
                          {...props}
                        />
                      ),
                      sup: ({ node, className, ...props }) => (
                        <sup
                          className={classNames("aui-md-sup", className)}
                          {...props}
                        />
                      ),
                      pre: ({ node, className, ...props }) => (
                        <pre
                          className={classNames("aui-md-pre", className)}
                          {...props}
                        />
                      ),
                      code: ({ node, className, ...props }) => {
                        const isCodeBlock = useIsMarkdownCodeBlock();
                        return (
                          <code
                            className={classNames(
                              !isCodeBlock && "aui-md-inline-code",
                              className
                            )}
                            {...props}
                          />
                        );
                      },
                    }}
                  >
                    {markdownText}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ReportContext.Provider>
  );
}
