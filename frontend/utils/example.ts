import { transformConversation } from "./conversation-transformer";

// 原始数据示例
const rawData = [
  {
    values: {
      messages: [
        {
          content: "帮我写一份3V设备的报告",
          type: "human",
          id: "9faeb1a9-e7d6-4d36-bf2a-5cfb34bc499f",
        },
      ],
    },
    created_at: "2025-06-04T03:07:31.216394+00:00",
  },
  // ... 其他数据
];

// 转换数据
const transformedData = transformConversation(rawData);
console.log(JSON.stringify(transformedData, null, 2));

// 输出结果将类似于：
/*
[
    {
        "id": "9faeb1a9-e7d6-4d36-bf2a-5cfb34bc499f",
        "createdAt": "2025-06-04T03:07:31.216394+00:00",
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "帮我写一份3V设备的报告"
            }
        ],
        "attachments": [],
        "metadata": {
            "custom": {}
        }
    },
    // ... 其他转换后的消息
]
*/
