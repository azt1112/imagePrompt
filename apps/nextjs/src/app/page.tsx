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
  // 重定向到默认语言页面
  const { redirect } = await import("next/navigation");
  redirect(`/${i18n.defaultLocale}`);
}