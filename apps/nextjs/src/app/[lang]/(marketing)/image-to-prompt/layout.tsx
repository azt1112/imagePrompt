import type { Metadata } from "next";
import type { Locale } from "~/config/i18n-config";

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const isEnglish = lang === "en";
  
  const title = isEnglish 
    ? "Free Image to Prompt Generator - AI Powered Image Prompt Tool"
    : "免费图片转提示词生成器 - AI驱动的图像提示词工具";
    
  const description = isEnglish
    ? "Convert any image to detailed AI prompts instantly. Our free image to prompt generator uses advanced AI to create perfect prompts for Midjourney, Stable Diffusion, and other AI art tools. Transform your images into creative prompts effortlessly."
    : "将任何图片瞬间转换为详细的AI提示词。我们的免费图片转提示词生成器使用先进的AI技术，为Midjourney、Stable Diffusion等AI艺术工具创建完美的提示词。轻松将您的图片转换为创意提示词。";

  const keywords = isEnglish
    ? "image to prompt, image to prompt generator, image prompt, prompt generator, AI image analysis, image description generator, AI prompt creator, free image to text, image to AI prompt, visual prompt generator"
    : "图片转提示词, 图像提示词生成器, 图片提示词, 提示词生成器, AI图像分析, 图像描述生成器, AI提示词创建器, 免费图片转文字, 图像转AI提示词, 视觉提示词生成器";

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "website",
      locale: lang,
      siteName: "SaasFly - AI Image Tools",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/${lang}/image-to-prompt`,
      languages: {
        en: "/en/image-to-prompt",
        zh: "/zh/image-to-prompt",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function ImageToPromptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Image to Prompt Generator",
            "description": "Free AI-powered tool to convert images into detailed prompts for AI art generation",
            "url": "https://saasfly.io/image-to-prompt",
            "applicationCategory": "DesignApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Image to prompt conversion",
              "AI-powered image analysis", 
              "Multiple AI model support",
              "Free to use",
              "No registration required"
            ]
          })
        }}
      />
      {children}
    </>
  );
}