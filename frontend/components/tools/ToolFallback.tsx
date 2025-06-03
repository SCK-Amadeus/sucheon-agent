import { ToolCallContentPartComponent } from "@assistant-ui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";

export const ToolFallback: ToolCallContentPartComponent = (props) => {
  const { toolName, argsText, result, status } = props;
  const isRunning = useMemo(() => status.type === "running", [status]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="mb-4 flex w-full flex-col gap-3 rounded-lg border py-3">
      <div className="flex items-center gap-2 px-4">
        {isRunning ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckIcon className="size-4" />
        )}
        <p className="">
          Used tool: <b>{toolName}</b>
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
