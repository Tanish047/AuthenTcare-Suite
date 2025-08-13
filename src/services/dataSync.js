// Simple offline/online sync stub; expand later.
export async function syncNow({ force = false } = {}) {
  // TODO: pull remote changes, push local queue, reconcile conflicts
  return { ok: true, force };
}
