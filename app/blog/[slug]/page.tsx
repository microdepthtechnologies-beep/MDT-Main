import { notFound, permanentRedirect } from "next/navigation";
import { getJournalPost } from "@/lib/journal";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getJournalPost((await params).slug);
  if (!post) notFound();
  permanentRedirect(post.href);
}
