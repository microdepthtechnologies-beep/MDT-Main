import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { quoteActor, quoteApiError } from "@/lib/quote-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const actor = await quoteActor();
    const db = await getDb();
    // Only an invalidation signal crosses this stream; documents and prices never do.
    const pipeline = actor.staff ? [] : [{ $match: { $or: [
      { "fullDocument.userId": actor.id },
      { "fullDocument.userId": { $exists: false }, "fullDocument.customerEmail": actor.email },
    ] } }];
    const changes = db.collection("quoteRequests").watch(pipeline, { fullDocument: "updateLookup", maxAwaitTimeMS: 1000 });
    const encoder = new TextEncoder();
    let stop = () => {};
    const stream = new ReadableStream({
      start(controller) {
        let closed = false;
        let checking = false;
        const send = (event: string) => { if (!closed) controller.enqueue(encoder.encode(`event: ${event}\ndata: {}\n\n`)); };
        const heartbeat = setInterval(async () => {
          if (checking || closed) return;
          checking = true;
          try {
            const account = await db.collection("accounts").findOne({ _id: new ObjectId(actor.id) }, { projection: { role: 1, passwordVersion: 1 } });
            if (!account || (account.passwordVersion || 0) !== actor.passwordVersion || (actor.staff && !["sales", "admin"].includes(account.role))) { send("revoked"); stop(); return; }
            send("ping");
          } catch { stop(); }
          finally { checking = false; }
        }, 15000);
        const lifetime = setTimeout(() => stop(), 50000);
        stop = () => {
          if (closed) return;
          closed = true;
          clearInterval(heartbeat); clearTimeout(lifetime);
          req.signal.removeEventListener("abort", stop);
          void changes.close().catch(() => {});
          try { controller.close(); } catch { /* The reader may already have cancelled. */ }
        };
        req.signal.addEventListener("abort", stop, { once: true });
        if (req.signal.aborted) { stop(); return; }
        send("ready");
        changes.on("change", () => send("changed"));
        changes.on("error", () => stop());
      },
      cancel() { stop(); },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no", Connection: "keep-alive" } });
  } catch (error) { return quoteApiError(error); }
}
