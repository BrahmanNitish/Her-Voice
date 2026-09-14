import './globals.css';
import { PlayerProvider } from '@/context/PlayerContext';
import BottomPlayer from '@/components/BottomPlayer';

export const metadata = {
  title: 'Voice of Magic | Personal Archive',
  description: 'Handcrafted musical memories & melodies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-slate-100 min-h-screen selection:bg-pink-500 selection:text-white pb-32">
        <PlayerProvider>
          {children}
          <BottomPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
