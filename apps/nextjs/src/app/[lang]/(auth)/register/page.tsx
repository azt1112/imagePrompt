import Link from "next/link";
import Image from "next/image";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import { Card, CardContent, CardHeader } from "@saasfly/ui/card";

import { UserAuthForm } from "~/components/user-auth-form";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
};

export default async function RegisterPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-6 pb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Image
                  src="/images/avatars/saasfly-logo.svg"
                  width="32"
                  height="32"
                  alt="SaasFly Logo"
                  className="text-white"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                创建账户
              </h1>
              <p className="text-gray-600 text-sm">
                输入您的邮箱地址开始使用
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <UserAuthForm lang={lang} dict={dict.login} disabled={false} />
            <div className="text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                点击继续即表示您同意我们的{" "}
                <Link
                  href={`/${lang}/terms`}
                  className="text-purple-600 hover:text-purple-700 underline underline-offset-2"
                >
                  服务条款
                </Link>{" "}
                和{" "}
                <Link
                  href={`/${lang}/privacy`}
                  className="text-purple-600 hover:text-purple-700 underline underline-offset-2"
                >
                  隐私政策
                </Link>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                已有账户？{" "}
                <Link
                  href={`/${lang}/login`}
                  className="text-purple-600 hover:text-purple-700 font-medium underline underline-offset-2"
                >
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
