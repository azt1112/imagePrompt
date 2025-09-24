import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "../../../../apps/nextjs/src/env.mjs";

const COZE_API_BASE_URL = "https://api.coze.cn";

// 文件上传接口
export const cozeRouter = createTRPCRouter({
  // 上传文件到扣子
  uploadFile: protectedProcedure
    .input(
      z.object({
        file: z.string(), // base64编码的文件内容
        fileName: z.string(),
        fileType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 将base64转换为Buffer
        const buffer = Buffer.from(input.file, 'base64');
        
        // 创建FormData
        const formData = new FormData();
        const blob = new Blob([buffer], { type: input.fileType });
        formData.append('file', blob, input.fileName);

        const response = await fetch(`${COZE_API_BASE_URL}/v1/files/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.COZE_API_TOKEN}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`文件上传失败: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('=== Coze File Upload Response ===');
        console.log('Upload Result:', JSON.stringify(result, null, 2));
        
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error('文件上传错误:', error);
        throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }),

  // 调用工作流生成提示词
  generatePrompt: protectedProcedure
    .input(
      z.object({
        fileId: z.string().optional(),
        fileUrl: z.string(),
        parameters: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Log the request details for debugging
        console.log("=== Coze Workflow Request ===");
        console.log("API URL:", `${COZE_API_BASE_URL}/v1/workflow/run`);
        console.log("Workflow ID:", env.COZE_WORKFLOW_ID);
        console.log("Image URL:", input.fileUrl);
        console.log("API Token (first 10 chars):", env.COZE_API_TOKEN?.substring(0, 10) + "...");

        // 构建请求体，确保参数格式正确 - 包含工作流输入节点中定义的所有参数
        const parameters: Record<string, any> = {};
        
        // 添加用户查询参数
        if (input.parameters?.userQuery) {
          parameters.userQuery = String(input.parameters.userQuery);
        } else {
          parameters.userQuery = "请为这张图片生成详细的提示词";
        }
        
        // 添加图片参数 - 使用正确的文件格式
        if (input.fileId) {
          // 对于Coze工作流，img参数需要是文件对象格式
          parameters.img = {
            type: "file",
            file_id: input.fileId
          };
        }
        
        // 添加提示词类型参数 - 根据工作流配置，这是必需的参数
        if (input.parameters?.promptType) {
          parameters.promptType = String(input.parameters.promptType);
        } else if (input.parameters?.model) {
          parameters.promptType = String(input.parameters.model);
        } else {
          parameters.promptType = "midjourney"; // 默认使用midjourney类型
        }
        
        // 验证必需参数
        if (!parameters.img) {
          throw new Error("缺少图片文件ID");
        }

        const requestBody = {
          workflow_id: env.COZE_WORKFLOW_ID,
          parameters: parameters,
        };

        console.log("Request Body:", JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${COZE_API_BASE_URL}/v1/workflow/run`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.COZE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log("=== Coze API Response ===");
        console.log("Status:", response.status);
        console.log("Status Text:", response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error Response Body:", errorText);
          
          // 解析错误响应
          let errorMessage = `工作流调用失败: ${response.status}`;
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error_message) {
              errorMessage = `工作流API返回错误: ${errorJson.error_message}`;
            } else if (errorJson.message) {
              errorMessage = `工作流API返回错误: ${errorJson.message}`;
            } else if (errorJson.msg) {
              errorMessage = `工作流API返回错误: ${errorJson.msg}`;
            } else {
              errorMessage = `工作流API返回错误: ${errorText}`;
            }
          } catch {
            errorMessage = `工作流API返回错误: ${errorText}`;
          }
          
          // Add helpful context for common errors
          if (errorMessage.includes("Workflow not found")) {
            errorMessage += `. 请检查工作流ID (${env.COZE_WORKFLOW_ID}) 是否正确，以及工作流是否已发布。`;
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("Success Response:", result);
        
        // 检查响应格式并提取执行ID
        if (result.code === 0 && result.data) {
          // 成功响应格式
          return {
            success: true,
            executeId: result.data.execute_id || result.data.id,
            data: result.data,
          };
        } else if (result.code === 4000) {
          // 错误响应格式 - 添加更详细的错误信息
          console.error("工作流执行失败详情:", result);
          let errorMsg = result.msg || '未知错误';
          if (result.detail) {
            errorMsg += ` (详情: ${JSON.stringify(result.detail)})`;
          }
          throw new Error(`工作流执行失败: ${errorMsg}`);
        } else {
          // 其他响应格式
          console.log("Unexpected response format:", result);
          return {
            success: true,
            executeId: result.execute_id || result.id,
            data: result,
          };
        }
      } catch (error) {
        console.error('工作流调用错误:', error);
        throw new Error(`工作流调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }),

  // 获取工作流执行结果
  getWorkflowResult: protectedProcedure
    .input(
      z.object({
        executeId: z.string(), // 工作流执行ID
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await fetch(`${COZE_API_BASE_URL}/v1/workflow/run/retrieve?execute_id=${input.executeId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.COZE_API_TOKEN}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`获取工作流结果失败: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error('获取工作流结果错误:', error);
        throw new Error(`获取工作流结果失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }),
});