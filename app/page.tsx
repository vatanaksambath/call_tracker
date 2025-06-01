// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard'); // or whatever route you want
}
