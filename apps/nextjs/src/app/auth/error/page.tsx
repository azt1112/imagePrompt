"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "服务器配置错误。请联系管理员。";
      case "AccessDenied":
        return "访问被拒绝。您没有权限访问此应用。";
      case "Verification":
        return "验证失败。请重试。";
      case "OAuthSignin":
        return "OAuth登录错误。请检查您的凭据。";
      case "OAuthCallback":
        return "OAuth回调错误。请检查回调URL配置。";
      case "OAuthCreateAccount":
        return "无法创建OAuth账户。";
      case "EmailCreateAccount":
        return "无法创建邮箱账户。";
      case "Callback":
        return "回调错误。";
      case "OAuthAccountNotLinked":
        return "OAuth账户未关联。该邮箱已被其他账户使用。";
      case "EmailSignin":
        return "邮箱登录错误。";
      case "CredentialsSignin":
        return "凭据登录失败。请检查您的用户名和密码。";
      case "SessionRequired":
        return "需要登录。请先登录。";
      default:
        return error ? `未知错误: ${error}` : "发生了未知错误。";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">认证错误</h3>
          <p className="mt-1 text-sm text-gray-500">
            {getErrorMessage(error)}
          </p>
          {error && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs text-gray-600">错误代码: {error}</p>
            </div>
          )}
          <div className="mt-6">
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              返回登录
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ErrorContent />
    </Suspense>
  );
}