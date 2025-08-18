import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useComposerRuntime,
  useThreadRuntime,
} from "@assistant-ui/react";
import { useContext, useState, useEffect, useRef, type FC } from "react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { ToolFallback } from "../tools/ToolFallback";
import { Avatar } from "antd";
import { ListContext, ReportContext } from "@/app/page";
import Image from "next/image";
const MarkdownText = makeMarkdownText({
  components: {
    a: ({ children, href }) => {
      const { setIsShowReport, setReportUrl, setReportType, setMarkdownText } =
        useContext(ReportContext);
      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsShowReport(true);
        // setReportUrl("https://www.baidu.com?markdown=123");
        setReportUrl(href ?? "");
      };
      return (
        <a
          href={href}
          className="aui-md-a"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          {children}
        </a>
      );
    },
  },
});
export const Thread: FC = () => {
  const { isShowList, setIsShowList } = useContext(ListContext);
  return (
    <ThreadPrimitive.Root
      className="bg-background box-border flex h-full flex-col overflow-hidden"
      style={{
        ["--thread-max-width" as string]: "42rem",
      }}
    >
      <ThreadPrimitive.Viewport className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
        <ThreadWelcome />
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            EditComposer: EditComposer,
            AssistantMessage: AssistantMessage,
          }}
        />
        <ThreadPrimitive.If empty={false}>
          <div className="min-h-8 flex-grow" />
        </ThreadPrimitive.If>
        <div className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
          <ThreadScrollToBottom />
          <Composer />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
        <div className="flex w-full flex-grow flex-col items-center justify-center">
          <Image
            src="/logo_transparent.png"
            alt="logo"
            width={150}
            height={150}
          />
          <h6 className="text-2xl font-bold p-4">九畴工业大模型</h6>
          <p className="mt-4 font-medium text-center">
            您好，我是九畴，一个工业大模型，能帮您查询设备数据、运维智能决策分析、故障根因分析等，希望能成为您得力的工业智能助手。请告诉我您需要什么帮助？
          </p>
        </div>
        {/* <ThreadWelcomeSuggestions /> */}
      </div>
    </ThreadPrimitive.Empty>
  );
};

const ThreadWelcomeSuggestions: FC = () => {
  return (
    <div className="mt-3 flex w-full items-stretch justify-center gap-4">
      <ThreadPrimitive.Suggestion
        className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
        prompt="What is the weather in Tokyo?"
        method="replace"
        autoSend
      >
        <span className="line-clamp-2 text-ellipsis text-sm font-semibold">
          What is the weather in Tokyo?
        </span>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
        prompt="What is assistant-ui?"
        method="replace"
        autoSend
      >
        <span className="line-clamp-2 text-ellipsis text-sm font-semibold">
          What is assistant-ui?
        </span>
      </ThreadPrimitive.Suggestion>
    </div>
  );
};

// 预设问题列表
const PRESET_QUESTIONS = [
  '介绍下你自己',
  '你都有哪些能力',
  '你都管理了哪些设备',
  '都有哪些设备有历史故障记录',
  '帮我分析下16号轧机',
  '帮我分析18B的故障根因',
  '请帮我看下16H最近一次润滑操作后，设备状态是否有变化',
  '帮我生成2024年9月到2025年4月设备全景报告'
];

const Composer: FC = () => {
  const [showPresets, setShowPresets] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);
  const presetPopupRef = useRef<HTMLDivElement>(null);

  // 点击外部区域关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        presetPopupRef.current &&
        !presetPopupRef.current.contains(event.target as Node) &&
        composerRef.current &&
        !composerRef.current.contains(event.target as Node)
      ) {
        setShowPresets(false);
      }
    };

    if (showPresets) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPresets]);

  const handlePresetToggle = () => {
    setShowPresets(!showPresets);
  };

  return (
    <div className="relative w-full" ref={composerRef}>
      {/* 预设问题弹窗 */}
      {showPresets && (
        <div
          ref={presetPopupRef}
          className="absolute bottom-full right-0 mb-2 flex flex-col-reverse gap-2 z-50"
        >
          {PRESET_QUESTIONS.map((question, index) => (
            <ThreadPrimitive.Suggestion
              key={index}
              className={cn(
                "w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg cursor-pointer",
                "text-sm text-gray-700 transition-all duration-300 ease-out",
                "hover:shadow-xl hover:-translate-y-1 hover:border-gray-300",
                "opacity-0 preset-card-animate"
              )}
              style={{
                animationDelay: `${index * 50}ms`
              }}
              prompt={question}
              method="replace"
              autoSend
              onClick={() => setShowPresets(false)}
            >
              {question}
            </ThreadPrimitive.Suggestion>
          ))}
        </div>
      )}
      
      <ComposerPrimitive.Root className="focus-within:border-ring/20 flex w-full flex-wrap items-end rounded-lg border bg-inherit px-2.5 shadow-sm transition-colors ease-in">
        <ComposerPrimitive.Input
          rows={1}
          autoFocus
          placeholder="请填写..."
          className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
        />
        <ComposerAction />
        <TooltipIconButton
          style={{
            marginLeft: "10px",
          }}
          tooltip="提示"
          variant="default"
          className="my-2.5 size-8 p-1 transition-opacity ease-in bg-[#f0f0f0] hover:bg-[#e0e0e0]"
          onClick={handlePresetToggle}
        >
          <Image src="/logo_transparent.png" alt="logo" width={40} height={40} />
        </TooltipIconButton>
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC = () => {
  // const composerRuntime = useComposerRuntime();
  // const threadComposerRuntime = useThreadRuntime();
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="发送"
            variant="default"
            className="my-2.5 size-8 p-2 transition-opacity ease-in bg-[#EC4600]"
          >
            <SendHorizontalIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            // disabled={false}
            // onClick={() => {
            //   // console.log(composerRuntime.cancel);
            //   console.log(threadComposerRuntime.cancelRun);
            //   composerRuntime.cancel();
            //   // thread.cancelRun();
            // }}
            tooltip="取消"
            variant="default"
            className="my-2.5 size-8 p-2 transition-opacity ease-in bg-[#EC4600] "
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="grid w-full max-w-[var(--thread-max-width)] auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 py-4 [&:where(>*)]:col-start-2">
      {/* <UserActionBar /> */}
      <div className="flex flex-row gap-3 ml-auto">
        <div className="bg-muted text-foreground col-start-2 row-start-2 max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5">
          <MessagePrimitive.Content />
        </div>
        {/* <Avatar size={"large"} className="mt-0.5 shrink-0 !bg-[#D0D7DB]">
          用户
        </Avatar> */}
      </div>

      <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="col-start-1 row-start-2 mr-3 mt-2.5 flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="bg-muted my-4 flex w-full max-w-[var(--thread-max-width)] flex-col gap-2 rounded-xl">
      <ComposerPrimitive.Input className="text-foreground flex h-8 w-full resize-none bg-transparent p-4 pb-0 outline-none" />

      <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost">Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative grid w-full max-w-[var(--thread-max-width)] grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] py-4">
      <div className="flex flex-row gap-3">
        <Image
          src="/logo_transparent.png"
          alt="logo"
          width={32}
          height={32}
          className="h-8 mt-1"
        />
        <div className="text-foreground col-span-2 col-start-2 row-start-1 my-1.5 max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7">
          <MessagePrimitive.Content
            components={{
              Text: MarkdownText,
              tools: {
                Fallback: ToolFallback,
              },
            }}
          />
        </div>
      </div>

      <AssistantActionBar />
      <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground data-[floating]:bg-background col-start-3 row-start-2 -ml-1 flex gap-1 data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="复制">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      {/* <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload> */}
    </ActionBarPrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "text-muted-foreground inline-flex items-center text-xs",
        className
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};
