import type {
  LangChainMessage,
  LangChainToolCall,
} from "@assistant-ui/react-langgraph";

interface UserMessageContentComplex {
  type: "text";
  text: string;
}

interface AssistantMessageContentComplex {
  type: "text";
  text: string;
}

interface RawConversationItem {
  values: {
    messages: Array<{
      id?: string;
      type: "system" | "human" | "tool" | "ai";
      content: string | Array<string | UserMessageContentComplex>;
      tool_call_id?: string;
      name?: string;
      tool_calls?: Array<{
        id: string;
        name?: string;
        function?: {
          name: string;
          arguments: string;
        };
      }>;
    }>;
  };
  created_at: string;
}

export function transformConversation(
  rawData: RawConversationItem[]
): LangChainMessage[] {
  const transformedMessages: LangChainMessage[] = [];
  let messageCounter = 0;

  // 按时间排序
  const sortedData = [...rawData].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  for (const item of sortedData) {
    for (const message of item.values.messages) {
      // 跳过 system 消息
      if (message.type === "system") {
        continue;
      }

      // 检查这条消息是否已经被处理过
      if (message.id && transformedMessages.some((m) => m.id === message.id)) {
        continue;
      }

      // 如果是工具消息，直接添加
      if (message.type === "tool") {
        transformedMessages.push({
          id: message.id || String(messageCounter++),
          type: "tool",
          content: message.content as string,
          tool_call_id: message.tool_call_id!,
          name: message.name!,
        });
        continue;
      }

      if (message.type === "human") {
        // 处理用户消息内容
        let processedContent: string | UserMessageContentComplex[];
        if (typeof message.content === "string") {
          processedContent = message.content;
        } else {
          processedContent = message.content.map((content) => {
            if (typeof content === "string") {
              return { type: "text", text: content };
            }
            return content;
          });
        }

        transformedMessages.push({
          id: message.id || String(messageCounter++),
          type: "human",
          content: processedContent,
        });
      } else if (message.type === "ai") {
        const toolCalls: LangChainToolCall[] | undefined = message.tool_calls
          ?.map((call) => ({
            id: call.id,
            name: call.function?.name || call.name || "unknown",
            args: call.function ? JSON.parse(call.function.arguments) : {},
          }))
          .filter((call) => call.name !== "unknown");

        transformedMessages.push({
          id: message.id || String(messageCounter++),
          type: "ai",
          content: message.content as string,
          tool_calls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
        });
      }
    }
  }

  return transformedMessages;
}
