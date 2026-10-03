"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Link as LinkIcon, Share2 } from "lucide-react";
import { motion, Variants } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";

// Animation Variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
};

export function BlogArticleClient({ post }: { post: any }) {
  // Simple read time estimation
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200) + " min read";

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground">
      <Nav />

      <main className="flex-1 px-6 pb-32 pt-[140px]">
        <motion.article 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-[800px]"
        >
          
          {/* Back Button */}
          <motion.div variants={fadeUp}>
            <Link
              href="/blog"
              className="group mb-10 inline-flex items-center gap-2 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-neutral-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border transition-transform group-hover:-translate-x-1">
                <ArrowLeft size={16} />
              </div>
              Back to Blog
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header variants={fadeUp} className="mb-12">
            <div className="mb-6 flex items-center gap-4 text-[13px] font-semibold text-muted-foreground">
              <span className="rounded-full bg-card px-3 py-1 text-foreground shadow-sm ring-1 ring-border">
                {post.category || "Updates"}
              </span>
              <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <span>•</span>
              <span>{readTime}</span>
            </div>
            
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
              {post.title}
            </h1>

            {/* Author Row */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground shadow-sm">
                  ZS
                </div>
                <div>
                  <p className="text-[15px] font-bold text-foreground">Zillion Team</p>
                  <p className="text-[13px] text-muted-foreground">Official Announcement</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={copyLink} className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm ring-1 ring-border hover:text-neutral-900 transition-colors">
                  <LinkIcon size={16} />
                </button>
              </div>
            </div>
          </motion.header>

          {/* Hero Image */}
          {post.featuredImage && (
            <motion.div variants={fadeUp} className="relative mb-16 aspect-[21/9] w-full overflow-hidden rounded-[2rem] bg-muted shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-border">
              <Image 
                src={post.featuredImage}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {/* Article Body */}
          <motion.div 
            variants={fadeUp} 
            className="prose prose-neutral max-w-[680px] mx-auto text-[17px] leading-[1.8] text-muted-foreground
              prose-headings:text-neutral-900 prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
              prose-p:mb-6
              prose-a:text-[#5cc8b8] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-neutral-900
              prose-blockquote:font-serif prose-blockquote:text-2xl prose-blockquote:leading-snug prose-blockquote:text-neutral-900 prose-blockquote:border-l-4 prose-blockquote:border-[#5cc8b8] prose-blockquote:pl-6 prose-blockquote:my-10
              prose-ul:list-disc prose-ul:pl-5 prose-li:mb-2
              prose-pre:bg-transparent prose-pre:p-0
              prose-code:text-neutral-900 prose-code:bg-black/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
          >
            <ReactMarkdown
              components={{
                code(props) {
                  const {children, className, node, ...rest} = props
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <div className="rounded-xl overflow-hidden shadow-sm my-8 text-[14px]">
                      <SyntaxHighlighter
                        PreTag="div"
                        children={String(children).replace(/\n$/, '')}
                        language={match[1]}
                        style={vscDarkPlus as any}
                        customStyle={{ margin: 0, padding: '1.5rem', background: '#171717' }}
                      />
                    </div>
                  ) : (
                    <code {...rest} className={className}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </motion.div>

          {/* Footer Share */}
          <motion.div variants={fadeUp} className="mx-auto mt-20 max-w-[680px] border-t border-border pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[15px] font-semibold text-foreground">
              Enjoyed this post? Share it with your network.
            </p>
            <button onClick={copyLink} className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-bold text-primary-foreground shadow-md transition-transform hover:scale-105 cursor-pointer">
              <Share2 size={16} /> Share Article
            </button>
          </motion.div>

        </motion.article>
      </main>

      <Footer />
    </div>
  );
}
