import Block1Header from '@/components/home/Block1Header';
import Block2HeroBanner from '@/components/home/Block2HeroBanner';
import Block3CoreServices from '@/components/home/Block3CoreServices';
import Block4HotNews from '@/components/home/Block4HotNews';
import Block5BottomNav from '@/components/home/Block5BottomNav';
import Block6AiAssistant from '@/components/home/Block6AiAssistant';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 pb-24 font-sans w-full relative">
      <Block1Header />
      <Block2HeroBanner />
      <Block3CoreServices />
      <Block4HotNews />
      <Block5BottomNav />
      <Block6AiAssistant />
    </main>
  );
}