import { useContext, useEffect, useRef, useState, type FC } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAssistantRuntime,
  useComposer,
  useThread,
  useThreadList,
  useThreadRuntime,
} from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon } from "lucide-react";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { ThreadListContext } from "@/app/MyRuntimeProvider";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button, Empty, Form, Input, message, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MenuFoldOutlined,
  PlusOutlined,
  PlusSquareFilled,
  PlusSquareOutlined,
} from "@ant-design/icons";
import { ListContext, ReportContext } from "@/app/page";
import { useHover } from "ahooks";
export const ThreadList: FC = () => {
  const { isShowList, setIsShowList } = useContext(ListContext);
  return (
    <div className="flex flex-col items-stretch gap-4 bg-[rgb(243,243,243)] px-2 py-4 h-full">
      <div className="text-2xl font-bold flex items-center justify-between">
        <Image src="/logo_transparent.png" alt="logo" width={32} height={32} />
        <div
          className="cursor-pointer ml-auto"
          onClick={() => setIsShowList(!isShowList)}
        >
          <Image
            src="/抽屉.svg"
            alt="logo"
            width={24}
            height={24}
            className={` ${isShowList ? "" : "fixed top-5 left-5"}`}
          />
          {/* <MenuFoldOutlined
            className={`text-2xl ${isShowList ? "rotate-0" : "rotate-180 fixed top-5 left-5"}`}
          /> */}
        </div>
      </div>
      <ThreadListNew />
      <ThreadListItems />
    </div>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild className="shrink-0">
      <Button
        type="text"
        icon={<PlusSquareFilled className="!text-[#EC4600]" />}
        className="!bg-white hover:!bg-[rgb(233,233,233)]"
      >
        新建任务
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  const { setIsShowReport } = useContext(ReportContext);
  const { threadList, setThreadList, switchThread, activeThreadId } =
    useContext(ThreadListContext);
  const [isEditModalShow, setIsEditModalShow] = useState(false);
  const [currentThread, setCurrentThread] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [form] = Form.useForm();
  const threadRuntime = useThreadRuntime();
  const threadItem = useThread();
  const runtime = useAssistantRuntime();

  if (threadList.length === 0) {
    return (
      <div className="flex  justify-center h-full">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无任务" />
      </div>
    );
  }
  const deleteThread = (threadId: string) => {
    const filteredThreadList = threadList.filter(
      (thread) => thread.id !== threadId
    );
    setThreadList(filteredThreadList);
    if (activeThreadId === threadId) {
      switchThread(filteredThreadList[0]?.id || "");
    }
  };
  // const ref = useRef<HTMLDivElement>(null);
  // const isHovering = useHover(ref);
  // useEffect(() => {
  //   console.log("isHovering", isHovering);
  // }, [isHovering]);
  return (
    // <ThreadListPrimitive.Items components={{ ThreadListItem }} />
    <div className="flex flex-col gap-2 overflow-y-auto">
      <div className="text-base text-gray-800 font-bold">任务列表</div>
      {threadList.map((thread) => (
        <div
          // ref={ref}
          className={cn(
            "cursor-pointer rounded-lg px-2.5 py-2 text-start hover:bg-gray-50 flex group ",
            activeThreadId === thread.id && " !bg-[rgb(233,233,233)]"
          )}
          key={thread.id}
          onClick={() => {
            console.log("threadItem", threadItem.messages);
            switchThread(thread.id);
          }}
        >
          <p className="truncate text-sm">{thread.title || "未命名任务"}</p>
          <div className="ml-auto hidden group-hover:flex transition-opacity  gap-2">
            <EditOutlined
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentThread(thread);
                form.setFieldsValue(thread);
                setIsEditModalShow(true);
              }}
            />
            <DeleteOutlined
              className="!text-red-500"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteThread(thread.id);
              }}
            />
          </div>
        </div>
      ))}
      <Modal
        title="编辑任务名称"
        open={isEditModalShow}
        onCancel={() => setIsEditModalShow(false)}
        onOk={() => {
          form.submit();
        }}
      >
        <Form
          autoComplete="off"
          form={form}
          onFinish={(values) => {
            setThreadList(
              threadList.map((thread) =>
                thread.id === currentThread?.id
                  ? { ...thread, title: values.title }
                  : thread
              )
            );
            message.success("任务名称修改成功");
            setIsEditModalShow(false);
          }}
        >
          <Form.Item label="会话名称" name="id" hidden>
            <Input placeholder="请输入会话名称" />
          </Form.Item>
          <Form.Item label="任务名称" name="title">
            <Input placeholder="请输入任务名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="data-[active]:bg-muted hover:bg-muted focus-visible:bg-muted focus-visible:ring-ring flex items-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2">
      <ThreadListItemPrimitive.Trigger className="flex-grow px-3 py-2 text-start">
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemArchive />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <p className="text-sm">
      <ThreadListItemPrimitive.Title fallback="新会话" />
    </p>
  );
};

const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="hover:text-primary text-foreground ml-auto mr-3 size-4 p-0"
        variant="ghost"
        tooltip="删除会话"
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
