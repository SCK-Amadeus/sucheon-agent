"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  AssistantRuntimeProvider,
  useCloudThreadListRuntime,
} from "@assistant-ui/react";
import { useLangGraphRuntime } from "@assistant-ui/react-langgraph";
import { createThread, getThreadHistory, sendMessage } from "@/lib/chatApi";
import { transformConversation } from "@/utils/conversation-transformer";
import { ReportContext } from "./page";

type ThreadType = {
  id: string;
  title: string;
};
export const ThreadListContext = createContext<{
  threadList: ThreadType[];
  setThreadList: (threadList: ThreadType[]) => void;
  switchThread: (threadId: string) => void;
  activeThreadId: string | undefined;
}>({
  threadList: [],
  setThreadList: () => {},
  switchThread: () => {},
  activeThreadId: undefined,
});

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const threadIdRef = useRef<string | undefined>(null);
  const [threadList, setThreadList] = useState<ThreadType[]>([]);
  const runtime = useLangGraphRuntime({
    threadId: threadIdRef.current ?? undefined,
    stream: async (messages) => {
      if (!threadIdRef.current) {
        const { thread_id } = await createThread();
        threadIdRef.current = thread_id;
        setThreadList((prev) => [{ id: thread_id, title: "" }, ...prev]);
      }
      const threadId = threadIdRef.current;
      return sendMessage({
        threadId,
        messages,
      });
    },
    onSwitchToThread: async (threadId) => {
      if (!threadId) {
        threadIdRef.current = null;
        return {
          messages: [],
        };
      }
      console.log("onSwitchToThread", threadId);
      threadIdRef.current = threadId;
      const history = await getThreadHistory(threadId);
      console.log("history", transformConversation(history as any));
      return {
        messages: transformConversation(history as any),
      };
    },
    onSwitchToNewThread: async () => {
      const { thread_id } = await createThread();
      threadIdRef.current = thread_id;
      setThreadList((prev) => [{ id: thread_id, title: "" }, ...prev]);
    },
  });
  useEffect(() => {
    threadIdRef.current = window.localStorage.getItem("activeThreadId") || null;
    if (threadIdRef.current) {
      runtime.switchToThread(threadIdRef.current);
    }
    setThreadList(
      JSON.parse(window.localStorage.getItem("threadList") || "[]")
    );
  }, [runtime]);
  useEffect(() => {
    window.localStorage.setItem("threadList", JSON.stringify(threadList));
  }, [threadList]);
  useEffect(() => {
    if (threadIdRef.current) {
      window.localStorage.setItem("activeThreadId", threadIdRef.current);
    } else {
      window.localStorage.removeItem("activeThreadId");
    }
  }, [threadIdRef.current]);
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadListContext.Provider
        value={{
          threadList,
          setThreadList,
          activeThreadId: threadIdRef.current,
          switchThread: (threadId) => {
            console.log("switchThread", threadList);
            runtime.switchToThread(threadId);
          },
        }}
      >
        {children}
      </ThreadListContext.Provider>
    </AssistantRuntimeProvider>
  );
}
