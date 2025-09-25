import { getDictionary } from "~/lib/get-dictionary";
import { i18n } from "~/config/i18n-config";
import { headers } from "next/headers";

import { CodeCopy } from "~/components/code-copy";
import { Comments } from "~/components/comments";
import { FeaturesGrid } from "~/components/features-grid";
import { RightsideMarketing } from "~/components/rightside-marketing";

import { AnimatedTooltip } from "@saasfly/ui/animated-tooltip";
import { BackgroundLines } from "@saasfly/ui/background-lines";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Badge } from "@saasfly/ui/badge";
import { ColourfulText } from "@saasfly/ui/colorful-text";
import * as Icons from "@saasfly/ui/icons";
import { 
  Wand2, 
  Sparkles, 
  Image as ImageIcon, 
  Zap,
  ArrowRight,
  Star,
  Users,
  Palette
} from "lucide-react";
import {VideoScroll} from "~/components/video-scroll";
import Link from "next/link";
import Image from "next/image";

const people = [
  {
    id: 1,
    name: "tianzx",
    designation: "CEO at Nextify",
    image: "https://avatars.githubusercontent.com/u/10096899",
    link: "https://x.com/nextify2024",
  },
  {
    id: 2,
    name: "jackc3",
    designation: "Co-founder at Nextify",
    image: "https://avatars.githubusercontent.com/u/10334353",
    link: "https://x.com/BingxunYao",
  },
  {
    id: 3,
    name: "imesong",
    designation: "Contributor",
    image: "https://avatars.githubusercontent.com/u/3849293",
  },
  {
    id: 4,
    name: "ziveen",
    designation: "Contributor",
    image: "https://avatars.githubusercontent.com/u/22560152",
  },
  {
    id: 5,
    name: "Zenuncl",
    designation: "Independent Software Developer",
    image: "https://avatars.githubusercontent.com/u/3316062",
  },
  {
    id: 6,
    name: "Innei",
    designation: "Indie Developer",
    image: "https://avatars.githubusercontent.com/u/41265413",
  },
];

export default async function RootPage() {
  // 使用默认语言获取字典
  const dict = await getDictionary(i18n.defaultLocale);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
          <div className="container relative">
            <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
              <Badge variant="outline" className="mb-4">
                {dict.marketing.badge}
              </Badge>
              <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
                <ColourfulText text={dict.marketing.title} />
              </h1>
              <span className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
                {dict.marketing.subtitle}
              </span>
              <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
                <Button asChild>
                  <Link href="/zh/dashboard">
                    {dict.marketing.getStarted}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/zh/docs">
                    {dict.marketing.learnMore}
                  </Link>
                </Button>
              </div>
              <div className="flex flex-row items-center justify-center mb-10 w-full">
                <AnimatedTooltip items={people} />
              </div>
            </section>
          </div>
        </BackgroundLines>
      </main>
    </div>
  );
}