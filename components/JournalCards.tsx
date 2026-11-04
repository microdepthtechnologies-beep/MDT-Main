import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { articleDate, type JournalPost } from "@/lib/journal";
import { MediaImage } from "./MediaImage";

export function JournalCards({ posts }: { posts: JournalPost[] }) {
  return <div className="journal-grid">{posts.map(post => <article className="journal-card" key={post.slug}><Link href={post.href} className="journal-card-image" tabIndex={-1} aria-hidden="true"><MediaImage src={post.image} alt="" fill sizes="(max-width:650px) 90vw, (max-width:1000px) 45vw, 30vw" className="object-cover" /><span><ArrowUpRight size={21} /></span></Link><div className="journal-card-meta"><span>{post.topic}</span><span>{post.readingMinutes} min read</span></div><h3><Link href={post.href}>{post.title}</Link></h3><p>{post.excerpt}</p><time dateTime={post.publishedAt.slice(0, 10)}>{articleDate(post.publishedAt)}</time></article>)}</div>;
}
