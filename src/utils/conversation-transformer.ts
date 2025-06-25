import type {
  LangChainMessage,
  LangChainToolCall,
  LangChainToolCallChunk,
} from "@assistant-ui/react-langgraph";

interface RawConversationItem {
  values: {
    messages: LangChainMessage[];
  };
  created_at: string;
  metadata?: Record<string, any>;
}

interface TransformedMessage {
  id: string;
  createdAt: string;
  role: "user" | "assistant";
  content: Array<{
    type: "text" | "tool-call";
    text?: string;
    toolCallId?: string;
    toolName?: string;
    args?: Record<string, any>;
    argsText?: string;
    result?: string;
  }>;
  attachments?: any[];
  metadata?: {
    custom: Record<string, any>;
    unstable_data?: any[];
    steps?: any[];
  };
  status?: {
    type: string;
    reason: string;
  };
}

export function transformConversation(
  rawData: RawConversationItem[]
): TransformedMessage[] {
  const transformedMessages: TransformedMessage[] = [];
  let messageCounter = 0;

  // 按时间排序
  const sortedData = [...rawData].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  for (const item of sortedData) {
    for (const message of item.values.messages) {
      // 检查这条消息是否已经被处理过
      if (transformedMessages.some((m) => m.id === message.id)) {
        continue;
      }

      const transformedMessage: TransformedMessage = {
        id: message.id || String(messageCounter++),
        createdAt: item.created_at,
        role: message.type === "human" ? "user" : "assistant",
        content: [],
        metadata: {
          custom: item.metadata || {},
        },
      };

      if (message.type === "human") {
        if (typeof message.content === "string") {
          transformedMessage.content.push({
            type: "text",
            text: message.content,
          });
        } else if (Array.isArray(message.content)) {
          for (const content of message.content) {
            if (typeof content === "string") {
              transformedMessage.content.push({
                type: "text",
                text: content,
              });
            } else if (content.type === "text") {
              transformedMessage.content.push({
                type: "text",
                text: content.text,
              });
            }
          }
        }
        transformedMessage.attachments = [];
      } else if (message.type === "ai") {
        // 处理工具调用
        if (message.tool_calls) {
          for (const toolCall of message.tool_calls) {
            transformedMessage.content.push({
              type: "tool-call",
              toolCallId: toolCall.id,
              toolName: toolCall.function.name,
              args: JSON.parse(toolCall.function.arguments),
              argsText: toolCall.function.arguments,
            });
          }
        }

        // 处理普通文本内容
        if (message.content) {
          if (typeof message.content === "string") {
            transformedMessage.content.push({
              type: "text",
              text: message.content,
            });
          }
        }

        transformedMessage.status = {
          type: "complete",
          reason: "unknown",
        };
        transformedMessage.metadata = {
          unstable_data: [],
          custom: item.metadata || {},
          steps: [],
        };
      } else if (message.type === "tool") {
        // 找到对应的assistant消息并添加工具调用结果
        const assistantMessage = transformedMessages.find((m) =>
          m.content.some(
            (c) =>
              c.type === "tool-call" && c.toolCallId === message.tool_call_id
          )
        );

        if (assistantMessage) {
          const toolCallContent = assistantMessage.content.find(
            (c) =>
              c.type === "tool-call" && c.toolCallId === message.tool_call_id
          );
          if (toolCallContent) {
            toolCallContent.result = message.content;
          }
        }
        continue;
      }

      transformedMessages.push(transformedMessage);
    }
  }

  return transformedMessages;
}
