import { SignIn } from "@clerk/nextjs";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "~/config/site";
import { getDictionary } from "~/lib/get-dictionary";
import { LangProps } from "~/types";

export async function generateMetadata({ params }: LangProps) {
  const dict = await getDictionary(params.lang);

  return {
    title: dict.login.welcome_back,
    description: dict.login.signin_title,
  };
}

export default async function LoginPage({ params }: LangProps) {
  const dict = await getDictionary(params.lang);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href={`/${params.lang}`}
        className="absolute left-4 top-4 md:left-8 md:top-8"
      >
        <div className="flex items-center space-x-2 text-sm">
          <ChevronLeft className="h-4 w-4" />
          <span>{dict.login.back}</span>
        </div>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {siteConfig.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.login.welcome_back}
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn 
            routing="path"
            path={`/${params.lang}/login-clerk`}
            signUpUrl={`/${params.lang}/register-clerk`}
            fallbackRedirectUrl={`/${params.lang}/dashboard`}
          />
        </div>
      </div>
    </div>
  );
}
