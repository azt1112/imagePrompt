import { z } from "zod";
import { createTRPCRouter, protectedProcedure, procedure } from "../trpc";
import { env } from "../../../../apps/nextjs/src/env.mjs";

const COZE_API_BASE_URL = "https://api.coze.cn";

// 文件上传接口
export const cozeRouter = createTRPCRouter({
  // 上传文件到扣子 - 公共访问版本（用于 image-to-prompt 功能）
  uploadFilePublic: procedure
    .input(
      z.object({
        file: z.string(), // base64编码的文件内容
        fileName: z.string(),
        fileType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log('=== Coze File Upload Debug Info ===');
        console.log('API Base URL:', COZE_API_BASE_URL);
        console.log('Upload Endpoint:', `${COZE_API_BASE_URL}/v1/files/upload`);
        console.log('File Name:', input.fileName);
        console.log('File Type:', input.fileType);
        console.log('File Size (base64):', input.file.length);
        console.log('API Token (first 20 chars):', env.COZE_API_TOKEN?.substring(0, 20) + '...');
        console.log('API Token exists:', !!env.COZE_API_TOKEN);
        
        // 将base64转换为Buffer
        const buffer = Buffer.from(input.file, 'base64');
        console.log('Buffer Size:', buffer.length);
        
        // 创建FormData
        const formData = new FormData();
        const blob = new Blob([buffer], { type: input.fileType });
        formData.append('file', blob, input.fileName);

        console.log('FormData created successfully');
        console.log('Request Headers will include:');
        console.log('- Authorization: Bearer [TOKEN]');
        console.log('- Content-Type: multipart/form-data (auto-set by FormData)');

        const response = await fetch(`${COZE_API_BASE_URL}/v1/files/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.COZE_API_TOKEN}`,
          },
          body: formData,
        });

        console.log('=== Coze API Response Details ===');
        console.log('Response Status:', response.status);
        console.log('Response Status Text:', response.statusText);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('=== Error Response Details ===');
          console.error('Error Status:', response.status);
          console.error('Error Text:', errorText);
          
          // 尝试解析错误响应
          let errorDetails = '';
          try {
            const errorJson = JSON.parse(errorText);
            console.error('Parsed Error JSON:', JSON.stringify(errorJson, null, 2));
            errorDetails = JSON.stringify(errorJson, null, 2);
          } catch (parseError) {
            console.error('Could not parse error response as JSON');
            errorDetails = errorText;
          }
          
          // 根据状态码提供更具体的错误信息
          let errorMessage = '';
          if (response.status === 401) {
            errorMessage = `认证失败 (401): API Token 可能无效或已过期。错误详情: ${errorDetails}`;
          } else if (response.status === 403) {
            errorMessage = `权限不足 (403): 没有文件上传权限。错误详情: ${errorDetails}`;
          } else if (response.status === 400) {
            errorMessage = `请求参数错误 (400): 请检查文件格式和大小。错误详情: ${errorDetails}`;
          } else {
            errorMessage = `文件上传失败 (${response.status}): ${errorDetails}`;
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('=== Coze File Upload Success Response ===');
        console.log('Upload Result:', JSON.stringify(result, null, 2));
        
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error('=== File Upload Error Details ===');
        console.error('Error Type:', error?.constructor?.name);
        console.error('Error Message:', error instanceof Error ? error.message : String(error));
        console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
        
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        throw new Error(`文件上传失败: ${errorMessage}`);
      }
    }),

  // 上传文件到扣子 - 需要认证的版本
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

  // 调用工作流生成提示词 - 公共访问版本（用于 image-to-prompt 功能）
  generatePromptPublic: procedure
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

  // 调用工作流生成提示词 - 需要认证的版本
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

  // 获取工作流执行结果 - 公共访问版本（用于 image-to-prompt 功能）
  getWorkflowResultPublic: procedure
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

  // 获取工作流执行结果 - 需要认证的版本
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