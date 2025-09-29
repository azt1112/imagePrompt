"use client";

import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import { Modal } from "~/components/modal";
import { siteConfig } from "~/config/site";
import { useSigninModal } from "~/hooks/use-signin-modal";

export const SignInModal = ({ dict }: { dict: Record<string, string> }) => {
  const signInModal = useSigninModal();
  const [signInClicked, setSignInClicked] = useState(false);

  return (
    <Modal showModal={signInModal.isOpen} setShowModal={signInModal.onClose}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-neutral-200 dark:border-neutral-800 bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url}>
            <Image
              src="/images/avatars/saasfly-logo.svg"
              className="mx-auto"
              width="64"
              height="64"
              alt=""
            />
          </a>
          <h3 className="font-urban text-2xl font-bold">{dict?.signup || "注册"}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{dict?.privacy || "只有您的电子邮件和头像会被存储。"}</p>
        </div>

        <div className="flex flex-col space-y-4 px-4 py-8 md:px-16">
          <Button
            variant="default"
            disabled={signInClicked}
            onClick={() => {
              setSignInClicked(true);
              signIn("google", { redirect: false })
                .then(() =>
                  setTimeout(() => {
                    signInModal.onClose();
                  }, 1000),
                )
                .catch((error) => {
                  console.error("signUp failed:", error);
                });
            }}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {signInClicked ? (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.Google className="mr-2 h-4 w-4" />
            )}{" "}
            {dict?.signup_google || "使用 Google 注册"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
