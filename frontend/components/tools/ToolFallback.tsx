import { ToolCallContentPartComponent, useMessage } from "@assistant-ui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { ReportContext } from "@/app/page";

export const ToolFallback: ToolCallContentPartComponent = (props) => {
  const { toolName, argsText, result, status } = props;
  const isRunning = useMemo(() => status.type === "running", [status]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLast } = useMessage();
  const toolNameMap = {
    intelligent_analysis_suggestions: "设备智能分析",
    search_equipment_data: "设备数据查询",
    analysis_root_cause: "设备故障根因分析",
    panoramic_equipment_status_report: "设备健康状态全景报告",
    data_acquisition_analysis_report: "数采系统数据分析",
  };
  const { setIsShowReport, setReportUrl, setReportType, setMarkdownText } =
    useContext(ReportContext);
  useEffect(() => {
    if (
      status.type === "complete" &&
      isLast &&
      toolName === "intelligent_analysis_suggestions"
    ) {
      console.log("result", result);
      console.log(JSON.parse(result));
      const link = JSON.parse(result).analysis_report_link;
      setIsShowReport(true);
      setReportType("iframe");
      setReportUrl(link ?? "");
    }
    if (
      status.type === "complete" &&
      isLast &&
      toolName === "panoramic_equipment_status_report"
    ) {
      const link = JSON.parse(result).report_link;
      setIsShowReport(true);
      setReportType("iframe");
      setReportUrl(link ?? "");
    }
    if (
      status.type === "complete" &&
      isLast &&
      (toolName === "analysis_root_cause" ||
        toolName === "data_acquisition_analysis_report")
    ) {
      setIsShowReport(true);
      setReportType("markdown");
      setMarkdownText(result);
    }
  }, [status, isLast, result]);
  // useEffect(() => {
  //   console.log(JSON.parse(result));
  // }, [result]);
  // useEffect(() => {
  //   console.log("useMessage", data);
  // }, [data]);
  return (
    <div className="mb-4 flex w-full flex-col gap-3 rounded-lg border py-3">
      <div className="flex items-center gap-2 px-4">
        {isRunning ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckIcon className="size-4" />
        )}
        <p className="">
          使用工具: <b>{toolNameMap[toolName] || toolName}</b>
        </p>
        <div className="flex-grow" />
        {/* <Button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button> */}
      </div>
      {/* {!isCollapsed && (
        <div className="flex flex-col gap-2 border-t pt-2">
          <div className="px-4">
            <pre className="whitespace-pre-wrap">{argsText}</pre>
          </div>
          {result !== undefined && (
            <div className="border-t border-dashed px-4 pt-2">
              <p className="font-semibold">Result:</p>
              <pre className="whitespace-pre-wrap">
                {typeof result === "string"
                  ? result
                  : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};
