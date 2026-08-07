"use client";

import Block1Header from "@/components/home/Block1Header";
import Block2HeroBanner from "@/components/home/Block2HeroBanner";
import Block3CoreServices from "@/components/home/Block3CoreServices";
import Block4HotNews from "@/components/home/Block4HotNews";
import Block5BottomNav from "@/components/home/Block5BottomNav";
import Block6AiAssistant from "@/components/home/Block6AiAssistant";

export default function HomePage() {
  return (
    <main className="max-w-md mx-auto bg-slate-50 min-h-screen pb-20 relative overflow-hidden">
      <Block1Header />
      <Block2HeroBanner />
      <Block3CoreServices />
      <Block4HotNews />
      <Block6AiAssistant />
      <Block5BottomNav />
    </main>
  );
}