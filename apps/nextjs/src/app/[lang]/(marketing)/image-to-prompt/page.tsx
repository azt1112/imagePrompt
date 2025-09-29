'use client';

import { useState, useEffect } from 'react';
import { Button } from '@saasfly/ui/button';
import { Card, CardContent } from '@saasfly/ui/card';
import { Input } from '@saasfly/ui/input';
import { Label } from '@saasfly/ui/label';
import { Textarea } from '@saasfly/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@saasfly/ui/select';
import { Upload, Copy, Image as ImageIcon } from 'lucide-react';
import { toast } from '@saasfly/ui/use-toast';
import { trpc } from '~/trpc/client';

export default function ImageToPromptPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [selectedModel, setSelectedModel] = useState<string>('general');

  // 添加 useEffect 来监听 prompt 状态变化
  useEffect(() => {
    console.log('=== prompt 状态发生变化 ===');
    console.log('新的 prompt 值:', prompt);
    console.log('prompt 长度:', prompt ? prompt.length : 0);
    console.log('prompt 类型:', typeof prompt);
  }, [prompt]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // tRPC mutations - 使用公共访问版本
  const uploadFileMutation = trpc.coze.uploadFilePublic.useMutation();
  const generatePromptMutation = trpc.coze.generatePromptPublic.useMutation();

  const handleGeneratePrompt = async () => {
    if (!selectedImage) {
      toast({
        title: '错误',
        description: '请先选择一张图片',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const base64Image = await convertToBase64(selectedImage);
      
      // 首先上传文件到 Coze
      const uploadResult = await uploadFileMutation.mutateAsync({
        file: base64Image,
        fileName: selectedImage.name,
        fileType: selectedImage.type,
      });

      if (!uploadResult.success) {
        setIsLoading(false);
        toast({
          title: '错误',
          description: '文件上传失败，请重试',
          variant: 'destructive',
        });
        return;
      }

      // 获取上传后的文件ID
      console.log('=== Upload Result Debug ===');
      console.log('Upload Result:', uploadResult);
      console.log('Upload Data:', uploadResult.data);
      
      // 从Coze API响应中获取file_id
      const fileId = uploadResult.data.data?.id || uploadResult.data.id;
      
      console.log('Extracted File ID:', fileId);
      
      if (!fileId) {
        console.error('无法获取文件ID，完整响应:', JSON.stringify(uploadResult, null, 2));
        setIsLoading(false);
        toast({
          title: '错误',
          description: '获取文件ID失败，请重试',
          variant: 'destructive',
        });
        return;
      }

      // 调用工作流生成提示词 - 只传递file_id，Coze会自动转换为file_url
      const workflowResult = await generatePromptMutation.mutateAsync({
        fileId: fileId,
        fileUrl: '', // 不需要传递fileUrl，工作流会自动处理file_id
        parameters: {
          promptType: selectedModel, // 使用promptType而不是model
          userQuery: "请为这张图片生成详细的提示词", // 使用固定的中文提示
        },
      });

      if (!workflowResult.success) {
        setIsLoading(false);
        toast({
          title: '错误',
          description: '工作流调用失败，请重试',
          variant: 'destructive',
        });
        return;
      }

      // 增强解析方案 - 处理多种数据结构
      console.log('=== 调试信息 ===');
      console.log('完整 workflowResult:', JSON.stringify(workflowResult, null, 2));
      console.log('原始数据:', workflowResult.data);
      console.log('数据类型:', typeof workflowResult.data);
      console.log('数据键值:', workflowResult.data ? Object.keys(workflowResult.data) : 'null');
      
      let finalOutput;
      
      // 方法1：检查 workflowResult.data.data 字段
      if (workflowResult.data && workflowResult.data.data) {
        const rawData = workflowResult.data.data;
        console.log('Raw data.data:', rawData);
        console.log('Raw data.data 类型:', typeof rawData);
        
        if (typeof rawData === 'string') {
          try {
            // 直接解析 JSON 字符串
            const parsedData = JSON.parse(rawData);
            console.log('解析后数据:', parsedData);
            
            // 提取 output 字段
            finalOutput = parsedData.output;
            console.log('提取的 output:', finalOutput);
          } catch (parseError) {
            console.error('JSON 解析错误:', parseError);
            // 如果解析失败，尝试其他方法
            const match = rawData.match(/"output":"([^"]+)"/);
            if (match && match[1]) {
              finalOutput = match[1];
              console.log('正则表达式提取成功:', finalOutput);
            }
          }
        } else if (rawData && typeof rawData === 'object') {
          // 如果已经是对象，直接提取
          finalOutput = rawData.output;
          console.log('直接提取成功:', finalOutput);
        }
      }
      
      // 方法2：如果上面没有找到，检查 workflowResult.data 本身
      if (!finalOutput && workflowResult.data) {
        console.log('尝试从 workflowResult.data 直接提取...');
        console.log('workflowResult.data 的类型:', typeof workflowResult.data);
        console.log('workflowResult.data 的内容:', workflowResult.data);
        
        // 首先尝试解析 JSON 字符串
        let parsedData = workflowResult.data;
        
        // 如果 data 是字符串，尝试解析为 JSON
        if (typeof workflowResult.data === 'string') {
          console.log('检测到字符串类型的 data，尝试 JSON 解析...');
          console.log('字符串内容预览:', workflowResult.data.substring(0, 200));
          
          try {
            parsedData = JSON.parse(workflowResult.data);
            console.log('JSON 解析成功，解析后的数据:', parsedData);
            console.log('解析后数据类型:', typeof parsedData);
          } catch (parseError) {
            console.error('JSON 解析失败:', parseError);
            console.log('将使用原始字符串进行处理');
            
            // 如果 JSON 解析失败，尝试直接正则提取
            const directOutputMatch = workflowResult.data.match(/"output"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
            if (directOutputMatch && directOutputMatch[1]) {
              finalOutput = directOutputMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
              console.log('直接正则提取成功:', finalOutput.substring(0, 100) + '...');
            } else if (workflowResult.data.trim() && workflowResult.data.length > 10) {
              // 如果是纯文本且长度合理，直接使用
              finalOutput = workflowResult.data;
              console.log('使用原始字符串作为提示词:', finalOutput.substring(0, 100) + '...');
            }
          }
        }
        
        // 如果成功解析或原本就是对象，从中提取 output
        if (parsedData && typeof parsedData === 'object' && !finalOutput) {
          console.log('从解析后的对象中提取 output...');
          
          // 检查是否有 output 字段
          if (parsedData.output) {
            finalOutput = parsedData.output;
            console.log('从 parsedData.output 提取成功:', finalOutput);
          }
          // 检查是否有 result 字段
          else if (parsedData.result && parsedData.result.output) {
            finalOutput = parsedData.result.output;
            console.log('从 parsedData.result.output 提取成功:', finalOutput);
          }
          // 检查是否有 detail 字段
          else if (parsedData.detail && parsedData.detail.output) {
            finalOutput = parsedData.detail.output;
            console.log('从 parsedData.detail.output 提取成功:', finalOutput);
          }
          // 检查是否有 msg 字段
          else if (parsedData.msg) {
            finalOutput = parsedData.msg;
            console.log('从 parsedData.msg 提取成功:', finalOutput);
          }
          // 如果 parsedData 是对象但没有明确的 output 字段，检查是否整个对象就是结果
          else {
            // 检查对象的所有值，看是否有长文本内容
            const values = Object.values(parsedData);
            for (const value of values) {
              if (typeof value === 'string' && value.length > 50 && 
                  (value.includes('cute') || value.includes('cartoon') || value.includes('描述') || value.includes('prompt'))) {
                finalOutput = value;
                console.log('从解析后对象值中找到可能的提示词:', finalOutput.substring(0, 100) + '...');
                break;
              }
            }
          }
        }
      }
      
      // 方法3：遍历所有可能的嵌套结构
      if (!finalOutput && workflowResult.data) {
        console.log('尝试深度搜索 output 字段...');
        
        // 确保我们使用的是解析后的数据
        let searchData = workflowResult.data;
        if (typeof workflowResult.data === 'string') {
          try {
            searchData = JSON.parse(workflowResult.data);
            console.log('深度搜索使用解析后的数据');
          } catch (e) {
            console.log('深度搜索使用原始数据');
          }
        }
        
        function findOutput(obj, path = '') {
          if (obj && typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
              const currentPath = path ? `${path}.${key}` : key;
              
              // 检查多种可能的输出字段
              if ((key === 'output' || key === 'msg' || key === 'result' || key === 'data') && 
                  typeof value === 'string' && value.trim()) {
                console.log(`在 ${currentPath} 找到输出字段 ${key}:`, value);
                return value;
              }
              
              if (typeof value === 'object') {
                const result = findOutput(value, currentPath);
                if (result) return result;
              }
            }
          }
          return null;
        }
        
        finalOutput = findOutput(searchData);
      }
      
      console.log('最终提取的 output:', finalOutput);
      console.log('finalOutput 类型:', typeof finalOutput);
      console.log('finalOutput 长度:', finalOutput ? finalOutput.length : 'null');
      
      // 修复验证逻辑：只有在真正无法提取时才抛出错误
      if (!finalOutput || (typeof finalOutput === 'string' && !finalOutput.trim())) {
        console.error('无法提取 output，完整响应:', JSON.stringify(workflowResult, null, 2));
        console.log('=== 直接提取失败，尝试轮询方式 ===');
        // 不抛出错误，而是继续执行轮询逻辑
      } else {
        console.log('=== 直接提取验证通过，继续处理 ===');
      }
      
      // 清理提取的内容 - 移除可能的转义字符和多余的引号
      let cleanedOutput = finalOutput;
      
      // 只有在成功提取到内容时才进行清理
      if (finalOutput && typeof finalOutput === 'string' && finalOutput.trim()) {
        console.log('开始清理输出内容...');
        console.log('原始内容:', finalOutput.substring(0, 200));
        
        // 如果内容以 "output": 开头，提取实际内容
        const outputMatch = finalOutput.match(/"output"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/); 
        if (outputMatch && outputMatch[1]) {
          cleanedOutput = outputMatch[1];
          console.log('从 output 字段提取内容:', cleanedOutput.substring(0, 100) + '...');
        }
        
        // 处理转义字符
        cleanedOutput = cleanedOutput
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        
        console.log('清理后内容:', cleanedOutput.substring(0, 200));
      }
      
      console.log('输出类型:', typeof cleanedOutput);
      console.log('输出长度:', cleanedOutput ? cleanedOutput.length : 0);
      
      if (cleanedOutput && typeof cleanedOutput === 'string' && cleanedOutput.trim().length > 0) {
        console.log('=== 成功提取到提示词，直接使用 ===');
        console.log('最终提示词:', cleanedOutput);
        console.log('=== 准备更新 prompt 状态 ===');
        console.log('当前 prompt 状态:', prompt);
        setPrompt(cleanedOutput);
        console.log('=== 已调用 setPrompt，新值:', cleanedOutput);
        setIsLoading(false);
        console.log('=== 已设置 isLoading 为 false ===');
        toast({
          title: '成功',
          description: '提示词生成成功！',
        });
        return; // 直接返回，不需要轮询
      }
      
      console.log('=== 未能直接提取到提示词，尝试轮询方式 ===');
      
      // 添加详细的响应结构调试
      console.log('=== 工作流响应结构分析 ===');
      console.log('workflowResult 类型:', typeof workflowResult);
      console.log('workflowResult 键:', Object.keys(workflowResult || {}));
      console.log('workflowResult.data 类型:', typeof workflowResult?.data);
      console.log('workflowResult.data 键:', Object.keys(workflowResult?.data || {}));
      if (workflowResult?.data?.data) {
        console.log('workflowResult.data.data 类型:', typeof workflowResult.data.data);
        console.log('workflowResult.data.data 键:', Object.keys(workflowResult.data.data || {}));
      }
      
      // 如果没有找到直接输出，尝试获取执行ID进行轮询
      let executeId;
      
      // 扩展 executeId 提取逻辑，添加更多可能的路径
      const possiblePaths = [
        () => workflowResult.executeId,
        () => workflowResult.execute_id,
        () => workflowResult.id,
        () => workflowResult.data?.executeId,
        () => workflowResult.data?.execute_id,
        () => workflowResult.data?.id,
        () => workflowResult.data?.data?.executeId,
        () => workflowResult.data?.data?.execute_id,
        () => workflowResult.data?.data?.id,
        () => workflowResult.result?.executeId,
        () => workflowResult.result?.execute_id,
        () => workflowResult.result?.id,
        () => workflowResult.response?.executeId,
        () => workflowResult.response?.execute_id,
        () => workflowResult.response?.id,
        // 尝试从嵌套的 success 对象中提取
        () => workflowResult.success?.data?.executeId,
        () => workflowResult.success?.data?.execute_id,
        () => workflowResult.success?.data?.id,
        // 尝试从字符串化的数据中提取
        () => {
          if (typeof workflowResult.data === 'string') {
            try {
              const parsed = JSON.parse(workflowResult.data);
              return parsed.executeId || parsed.execute_id || parsed.id;
            } catch (e) {
              return null;
            }
          }
          return null;
        }
      ];
      
      for (let i = 0; i < possiblePaths.length; i++) {
        try {
          const result = possiblePaths[i]();
          if (result && typeof result === 'string') {
            executeId = result;
            console.log(`=== 在路径 ${i + 1} 找到 executeId: ${executeId} ===`);
            break;
          }
        } catch (e) {
          // 忽略提取错误，继续尝试下一个路径
        }
      }
      
      console.log('最终提取的 Execute ID:', executeId);
      
      if (!executeId) {
        console.error('=== 所有路径都无法提取 executeId ===');
        console.error('完整响应结构:', JSON.stringify(workflowResult, null, 2));
        setIsLoading(false);
        toast({
          title: '错误',
          description: '无法获取工作流执行ID，请重试',
          variant: 'destructive',
        });
        return;
      }

      // 轮询获取结果 - 改进错误处理
      let attempts = 0;
      const maxAttempts = 30; // 最多等待30次，每次2秒
      
      const pollResult = async (): Promise<void> => {
        console.log(`=== 开始轮询，尝试次数: ${attempts + 1}/${maxAttempts} ===`);
        
        if (attempts >= maxAttempts) {
          setIsLoading(false);
          toast({
            title: '错误',
            description: '生成提示词超时，请重试',
            variant: 'destructive',
          });
          return;
        }

        try {
          // 使用 tRPC 客户端直接调用查询
          const result = await trpc.coze.getWorkflowResult.query({
            executeId: executeId,
          });

          console.log(`=== Poll Attempt ${attempts + 1} ===`);
          console.log('Poll Result:', result);

          // 增强轮询解析方案 - 处理多种数据结构
          console.log('=== 轮询调试信息 ===');
          console.log('轮询原始数据:', result.data);
          console.log('轮询数据类型:', typeof result.data);
          
          let workflowData;
          let extractedOutput;
          
          // 方法1：处理字符串格式
          if (typeof result.data === 'string') {
            try {
              // 直接解析 JSON 字符串
              const parsedData = JSON.parse(result.data);
              console.log('轮询解析后数据:', parsedData);
              
              // 提取 output 字段
              extractedOutput = parsedData.output;
              console.log('轮询提取的 output:', extractedOutput);
            } catch (parseError) {
              console.error('轮询 JSON 解析错误:', parseError);
              // 如果解析失败，尝试其他方法
              const match = result.data.match(/"output":"([^"]+)"/);
              if (match && match[1]) {
                extractedOutput = match[1];
                console.log('轮询正则表达式提取成功:', extractedOutput);
              }
            }
            
            if (extractedOutput) {
              workflowData = { status: 'success', data: extractedOutput };
              console.log('轮询解析成功:', workflowData);
            } else {
              workflowData = result.data;
              console.log('轮询使用原始数据:', workflowData);
            }
          } 
          // 方法2：处理数组格式
          else if (Array.isArray(result.data)) {
            workflowData = result.data[0];
            console.log('=== 直接从轮询数组中提取第一个元素 ===');
            
            // 尝试从数组元素中提取 output
            if (workflowData && workflowData.output) {
              extractedOutput = workflowData.output;
              console.log('从数组元素提取 output:', extractedOutput);
            }
          } 
          // 方法3：处理对象格式
          else {
            workflowData = result.data;
            console.log('=== 直接使用轮询结果对象 ===');
            
            // 尝试从对象中提取 output
            if (workflowData && workflowData.output) {
              extractedOutput = workflowData.output;
              console.log('从对象提取 output:', extractedOutput);
            }
            // 检查嵌套的 data.output
            else if (workflowData && workflowData.data && workflowData.data.output) {
              extractedOutput = workflowData.data.output;
              console.log('从嵌套对象提取 output:', extractedOutput);
            }
          }
          
          // 方法4：深度搜索 output 字段（轮询版本）
          if (!extractedOutput && result.data) {
            console.log('轮询深度搜索 output 字段...');
            
            function findOutputInPoll(obj, path = '') {
              if (obj && typeof obj === 'object') {
                for (const [key, value] of Object.entries(obj)) {
                  const currentPath = path ? `${path}.${key}` : key;
                  
                  if (key === 'output' && typeof value === 'string' && value.trim()) {
                    console.log(`轮询在 ${currentPath} 找到 output:`, value);
                    return value;
                  }
                  
                  if (typeof value === 'object') {
                    const result = findOutputInPoll(value, currentPath);
                    if (result) return result;
                  }
                }
              }
              return null;
            }
            
            extractedOutput = findOutputInPoll(result.data);
            if (extractedOutput) {
              workflowData = { status: 'success', data: extractedOutput };
              console.log('轮询深度搜索成功:', workflowData);
            }
          }
          
          console.log('=== 轮询工作流数据调试 ===');
          console.log('原始 result.data:', result.data);
          console.log('原始 result.data 类型:', typeof result.data);
          console.log('解析后 workflowData:', workflowData);
          console.log('解析后 workflowData 类型:', typeof workflowData);
          console.log('最终提取的 extractedOutput:', extractedOutput);
          
          if (workflowData && (workflowData.status === 'success' || extractedOutput)) {
            // 优先使用提取的 output，否则使用 workflowData.data
            let generatedPrompt = extractedOutput || workflowData.data;
            
            console.log('=== 轮询输出调试 ===');
            console.log('Generated Prompt:', generatedPrompt);
            console.log('Generated Prompt Type:', typeof generatedPrompt);

            console.log('轮询生成的提示词:', generatedPrompt);

            if (generatedPrompt && typeof generatedPrompt === 'string' && generatedPrompt.trim()) {
              console.log('=== 轮询成功获取提示词 ===');
              setPrompt(generatedPrompt);
              setIsLoading(false);
              toast({
                title: '成功',
                description: '提示词生成成功！',
              });
              return; // 成功后直接返回，避免继续执行
            } else {
              console.error('轮询无法提取提示词，完整输出:', JSON.stringify(workflowData, null, 2));
              console.error('提取的 output:', extractedOutput);
              // 不抛出错误，而是设置错误状态
              setIsLoading(false);
              toast({
                title: '错误',
                description: '未能获取生成的提示词，请重试',
                variant: 'destructive',
              });
              return;
            }
          } else if (workflowData && workflowData.status === 'running') {
            // 继续等待
            attempts++;
            setTimeout(pollResult, 2000);
          } else if (workflowData.status === 'failed') {
            console.error('工作流执行失败:', workflowData.error_message);
            setIsLoading(false);
            toast({
              title: '错误',
              description: workflowData.error_message || '工作流执行失败',
              variant: 'destructive',
            });
            return;
          } else {
            console.error('未知的轮询结果:', result);
            console.error('解析后的工作流数据:', workflowData);
            setIsLoading(false);
            toast({
              title: '错误',
              description: workflowData?.error_message || '工作流执行失败',
              variant: 'destructive',
            });
            return;
          }
        } catch (pollError) {
          console.error('轮询过程中出错:', pollError);
          if (attempts < maxAttempts - 1) {
            attempts++;
            setTimeout(pollResult, 2000);
          } else {
            console.error('轮询达到最大尝试次数，停止轮询');
            setIsLoading(false);
            toast({
              title: '错误',
              description: '生成提示词失败，请重试',
              variant: 'destructive',
            });
            return;
          }
        }
      };

      await pollResult();

    } catch (error) {
      console.error('Error generating prompt:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // 检查是否已经成功设置了提示词
      if (prompt && prompt.trim().length > 0) {
        console.log('虽然出现错误，但提示词已成功生成，忽略错误');
        return;
      }
      
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '生成提示词时出错，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      toast({
        title: '成功',
        description: '提示词已复制到剪贴板',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-pink-400">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Free Image to Prompt Generator</h1>
            <p className="text-xl text-purple-100 mb-2">
              Transform Any Image into Perfect AI Prompts Instantly
            </p>
            <p className="text-purple-200">
              Our advanced image to prompt generator analyzes your images and creates detailed, accurate prompts for AI art generation. Perfect for Midjourney, Stable Diffusion, and other AI image tools.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 flex">
              <button
                onClick={() => setActiveTab('image')}
                className={`px-6 py-2 rounded-md flex items-center gap-2 transition-all ${
                  activeTab === 'image'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image to Prompt Generator
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-6 py-2 rounded-md flex items-center gap-2 transition-all ${
                  activeTab === 'text'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Text to Prompt
              </button>
            </div>
          </div>

          {/* Main Content */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Upload */}
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-4">Upload Your Image</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Upload any image to generate detailed AI prompts. Our image prompt generator supports JPG, PNG, WEBP formats.
                    </p>
                    <div className="flex items-center justify-center w-full">
                      <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 mb-4 text-purple-400" />
                            <p className="mb-2 text-sm text-purple-600">
                              Upload a photo or drag and drop
                            </p>
                            <p className="text-xs text-purple-500">PNG, JPG, WEBP or SVG</p>
                          </div>
                        )}
                        <Input
                          id="image-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </Label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="text-sm font-medium mb-2 block">Input Image URL</Label>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Right Column - Preview */}
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-4">Image Preview</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Your uploaded image will be displayed here for preview before generating AI prompts.
                    </p>
                    <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                          <p>Your image will show here</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 添加一个占位区域以保持对齐 */}
                  <div className="mt-6 h-10 flex items-center">
                    <p className="text-sm text-gray-500">Preview will update automatically</p>
                  </div>
                </div>
              </div>

              {/* AI Model Selection */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Select AI Model for Prompt Generation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose the best AI model for your image prompt needs. Each prompt generator is optimized for different AI art platforms.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { id: 'general', name: 'General Images Prompt', desc: 'Natural language description of any image', selected: true },
                    { id: 'flux', name: 'Flux', desc: 'Optimized for state-of-the-art Flux AI models, licensed under Apache 2.0', selected: false },
                    { id: 'midjourney', name: 'Midjourney', desc: 'Tailored for Midjourney generation with Midjourney parameters', selected: false },
                    { id: 'stable', name: 'Stable Diffusion', desc: 'Formatted for Stable Diffusion models', selected: false }
                  ].map((model) => (
                    <div
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedModel === model.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <h4 className="font-medium text-sm mb-2">{model.name}</h4>
                      <p className="text-xs text-gray-600">{model.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleGeneratePrompt}
                  disabled={!selectedImage || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-2 h-10"
                >
                  {isLoading ? 'Generating Image Prompt...' : 'Generate AI Prompt from Image'}
                </Button>
              </div>

              {/* Generated Prompt */}
              <div className="mt-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Generated AI Image Prompt</h3>
                    {prompt && (
                      <Button
                        onClick={handleCopyPrompt}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    )}
                  </div>
                  {prompt ? (
                    <Textarea
                      value={prompt}
                      readOnly
                      className="min-h-32 bg-white border-0 resize-none"
                    />
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      <p className="mb-2">Upload an image to generate AI prompts</p>
                      <p className="text-sm">Your generated image prompt will appear here after processing</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Pro Tip:</strong> For best results with our image to prompt generator, use high-quality images with clear subjects. Our AI prompt generator works best with well-lit photos and detailed artwork.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Section */}
          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Advanced Image to Prompt Generator Technology
            </h2>
            <p className="text-purple-100 max-w-3xl mx-auto mb-6">
              Our AI-powered image prompt generator uses cutting-edge computer vision to analyze your images and create detailed, accurate prompts. Perfect for artists, designers, and AI enthusiasts who need high-quality image prompts for their creative projects.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Instant Image Analysis</h3>
                <p className="text-purple-200 text-sm">
                  Upload any image and get detailed AI prompts in seconds. Our image to prompt technology works with photos, artwork, and digital images.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Multiple AI Models</h3>
                <p className="text-purple-200 text-sm">
                  Choose from specialized prompt generators optimized for Midjourney, Stable Diffusion, FLUX, and other popular AI art platforms.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Free & No Registration</h3>
                <p className="text-purple-200 text-sm">
                  Use our image prompt generator completely free. No account required, no limits on usage. Start creating better AI art prompts today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}