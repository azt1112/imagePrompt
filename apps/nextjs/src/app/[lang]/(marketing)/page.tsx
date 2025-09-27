import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "~/lib/get-dictionary";

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

import type { Locale } from "~/config/i18n-config";
import {VideoScroll} from "~/components/video-scroll";

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

export default async function IndexPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);

  return (
    <>

      {/* AI Image Tools Section */}
      <section className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20">
        {/* Hero Section */}
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 bg-purple-100 text-purple-700">
              AI Powered Image Tools
            </Badge>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-6xl">
              Create Better AI Art
              <br />
              with{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Image Prompt
              </span>
            </h1>
            
            <p className="mb-8 text-xl text-gray-600 md:text-2xl">
              Inspire ideas. Enhance image prompts. Create masterpieces
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href={`/${lang}/image-to-prompt`} className="flex items-center">
                  Try it now !
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Tutorials
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">
              AI Image Tools Suite
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              {/* AI Prompt Enhancer */}
              <Link href={`/${lang}/image-to-prompt`}>
                <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <Sparkles className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">AI Image to Prompt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Convert images into detailed, descriptive prompts for AI generation
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              {/* AI Describe Image */}
              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                    <Wand2 className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">AI Describe Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Let AI help you understand and describe any image in detail
                  </CardDescription>
                </CardContent>
              </Card>

              {/* AI Image Generator */}
              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">AI Image Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Transform your image prompts into stunning AI-powered image generation
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Interest Links */}
        <div className="container px-4 py-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-gray-600">
              You may be interested in:{" "}
              <a href="#" className="text-purple-600 hover:underline">
                What is an Image Prompt?
              </a>{" "}
              <a href="#" className="text-purple-600 hover:underline">
                How to Write Effective Image Prompt?
              </a>
            </p>
          </div>
        </div>

        {/* AI Tools Suite Section */}
        <div className="container px-4 py-20 bg-gray-50 rounded-lg">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              AI Powered Image Prompt Tools
            </h2>
            <p className="mb-12 text-xl text-gray-600">
              A complete suite of AI tools covering every aspect of your image creation journey
            </p>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                  <Star className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Premium Quality</h3>
                <p className="text-gray-600">
                  Professional-grade AI tools for creating stunning image prompts
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Community Driven</h3>
                <p className="text-gray-600">
                  Join thousands of creators sharing and improving their prompts
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Palette className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Creative Freedom</h3>
                <p className="text-gray-600">
                  Unlimited possibilities for your artistic vision and creativity
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              Ready to Create Amazing AI Art?
            </h2>
            <p className="mb-8 text-xl text-gray-600">
              Start your creative journey today with our powerful AI image prompt tools
            </p>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link href={`/${lang}/image-to-prompt`} className="flex items-center">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          </div>
        </div>
      </section>

      <section className="container pt-24">
        <div className="flex flex-col justify-center items-center pt-10">
          <div className="text-lg text-neutral-500 dark:text-neutral-400">{dict.marketing.sponsor.title}</div>
          <div className="mt-4 flex items-center gap-4">
            <Link href="https://go.clerk.com/uKDp7Au" target="_blank">
              <Image src="/images/clerk.png" width="48" height="48" alt="twillot"/>
            </Link>
            <Link href="https://www.twillot.com/" target="_blank">
              <Image src="https://www.twillot.com/logo-128.png" width="48" height="48" alt="twillot"/>
            </Link>
            <Link href="https://www.setupyourpay.com/" target="_blank">
              <Image src="https://www.setupyourpay.com/logo.png" width="48" height="48" alt="setupyourpay" />
            </Link>
            <Link href="https://opencollective.com/saasfly" target="_blank">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:bg-accent dark:hover:bg-neutral-800/30">
                <Icons.Heart className="w-5 h-5 fill-pink-600 text-pink-600 dark:fill-pink-700 dark:text-pink-700" />
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-200">{dict.marketing.sponsor.donate || ''}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="container pt-8">
        <VideoScroll dict={dict.marketing.video}/>
      </section>

      <section className="w-full px-8 pt-10 sm:px-0 sm:pt-24 md:px-0 md:pt-24 xl:px-0 xl:pt-24">
        <div className="flex h-full w-full flex-col items-center pb-[100px] pt-10">
          <div>
            <h1 className="mb-6 text-center text-3xl font-bold dark:text-zinc-100 md:text-5xl">
              {dict.marketing.people_comment.title}
            </h1>
          </div>
          <div className="mb-6 text-lg text-neutral-500 dark:text-neutral-400">
            {dict.marketing.people_comment.desc}
          </div>

          <div className="w-full overflow-x-hidden">
            <Comments/>
          </div>
        </div>
      </section>
    </>
  );
}
