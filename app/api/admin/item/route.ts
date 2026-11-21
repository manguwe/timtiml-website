import { del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { updateItems } from '@/lib/portfolio';
import { fail, isAdmin, json } from '@/lib/server/admin-auth';

export const runtime = 'nodejs';

/** Rename / re-describe an item. */
export async function PATCH(req: Request) {
  if (!isAdmin(req)) return fail(401, 'Please log in.');
  let b: { id?: unknown; title?: unknown; note?: unknown; category?: unknown } = {};
  try {
    b = await req.json();
  } catch {
    return fail(400, 'Bad request.');
  }
  if (typeof b.id !== 'string') return fail(400, 'Bad request.');
  const title = typeof b.title === 'string' ? b.title.trim().slice(0, 100) : undefined;
  const note = typeof b.note === 'string' ? b.note.trim().slice(0, 120) : undefined;
  try {
    await updateItems((items) =>
      items.map((i) =>
        i.id !== b.id
          ? i
          : {
              ...i,
              title: title || i.title,
              note: note ?? i.note,
              category: i.kind === 'document' && (b.category === 'certificate' || b.category === 'other') ? b.category : i.category,
            },
      ),
    );
    revalidatePath('/', 'layout');
    return json({ ok: true });
  } catch {
    return fail(503, 'Could not save the change.');
  }
}

/** Delete an item and its file. */
export async function DELETE(req: Request) {
  if (!isAdmin(req)) return fail(401, 'Please log in.');
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return fail(400, 'Bad request.');
  try {
    let url: string | undefined;
    await updateItems((items) => items.filter((i) => (i.id === id ? ((url = i.url), false) : true)));
    if (url) await del(url).catch(() => undefined);
    revalidatePath('/', 'layout');
    return json({ ok: true });
  } catch {
    return fail(503, 'Could not delete that item.');
  }
}
