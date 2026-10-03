"use client";

import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/hero/Nav";
import { Footer } from "@/components/footer/Footer";
import { motion, Variants } from "motion/react";

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

function getExcerpt(content: string) {
  // strip markdown and return first 150 chars
  const stripped = content.replace(/[#*`_\[\]()]/g, '');
  return stripped.length > 150 ? stripped.slice(0, 150) + "..." : stripped;
}

export function BlogClientWrapper({ posts }: { posts: any[] }) {
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.slice(1);

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground">
      <Nav />

      <main className="flex-1 px-6 pb-32 pt-[110px]">
        <motion.div 
          className="mx-auto max-w-[1100px]"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          
          {/* Header */}
          <motion.div variants={fadeUp} className="mx-auto mb-10 flex flex-col items-center text-center">
            <span className="mb-4 rounded-full bg-card px-4 py-1 text-[11px] font-bold text-foreground shadow-sm border border-border">
              Blog
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-[56px] leading-[1.1]">
              Practical reads to help <br /> you move <span className="font-serif italic font-medium pr-2">faster.</span>
            </h1>
          </motion.div>

          {posts.length === 0 && (
            <motion.div variants={fadeUp} className="text-center py-20 text-muted-foreground">
              <p>No blog posts published yet. Check back soon!</p>
            </motion.div>
          )}

          {/* Featured Post */}
          {featuredPost && (
            <motion.div variants={fadeUp}>
              <Link href={`/blog/${featuredPost.slug}`} className="group mb-8 block">
              <div className="flex flex-col md:flex-row bg-card rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-500 hover:scale-[1.01] hover:shadow-xl">
                {/* Image Side */}
                <div className="relative w-full md:w-[50%] lg:w-[55%] aspect-[16/10] md:aspect-auto md:min-h-[340px] rounded-[20px] overflow-hidden bg-muted">
                  <Image 
                    src={featuredPost.featuredImage || "/affiliate-program-bg.png"}
                    alt={featuredPost.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>

                {/* Content Side */}
                <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10 w-full md:w-[50%] lg:w-[45%]">
                  <span className="bg-neutral-100/80 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide text-muted-foreground w-fit mb-4">
                    {featuredPost.category || "Updates"}
                  </span>
                  
                  <h2 className="text-2xl md:text-3xl lg:text-[34px] font-bold tracking-tight text-foreground mb-3 leading-[1.15]">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-muted-foreground text-[14px] leading-relaxed mb-8">
                    {getExcerpt(featuredPost.content)}
                  </p>
                  
                  <div className="flex justify-between items-center mt-auto text-[12px] font-bold text-foreground">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {new Date(featuredPost.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="font-serif italic font-semibold text-[16px] text-muted-foreground">
                      by Zillion Team
                    </span>
                  </div>
                </div>
              </div>
              </Link>
            </motion.div>
          )}

          {/* Grid Posts */}
          {gridPosts.length > 0 && (
            <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="bg-card rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full transition-transform duration-500 hover:scale-[1.02] hover:shadow-xl">
                    {/* Image with white fade */}
                    <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden mb-6 bg-muted">
                      <Image 
                        src={post.featuredImage || "/affiliate-program-bg.png"}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient Fade to melt into card */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent z-10" />
                      
                      {/* Category Pill */}
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur shadow-sm text-foreground px-3 py-1 rounded-full text-[11px] font-bold tracking-wide z-20">
                        {post.category || "Updates"}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="px-4 pb-6 flex-1 flex flex-col relative z-20 -mt-8">
                      <h3 className="text-[18px] font-bold tracking-tight text-foreground mb-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        {getExcerpt(post.content)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
          
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
