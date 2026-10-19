export const PHASES = ['SEED','DISCERN','COMPOSE','ACT','RETURN'];
export const LANES = ['NOW','NEXT','HELD','COMPOST','WILD'];
export const DECISIONS = ['SELECT_FOR_REVIEW','HOLD_LOCALLY','DECLINE_LOCALLY'];

export function checkBoard(board) {
  if (board.authority !== "none" || !Array.isArray(board.records)) throw Error("Invalid board authority");
  const ids = new Set();
  for (const r of board.records) {
    if (!r.id || !r.source || !r.next || ids.has(r.id)) throw Error("Invalid card identity");
    if (!PHASES.includes(r.phase) || !LANES.includes(r.lane)) throw Error("Invalid projection");
    ids.add(r.id);
  }
  return true;
}
export async function sha256Text(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, "0")).join("");
}

export async function localSelection(record, decision, snapshotSha, at) {
  if (!record?.source || !record.next || !DECISIONS.includes(decision)) throw Error("Invalid local choice");
  if (!/^[a-f0-9]{64}$/.test(snapshotSha) || Number.isNaN(Date.parse(at))) throw Error("Missing receipt basis");
  const receipt = {
    kind: "PHASELIFT_LOCAL_SELECTION_V0",
    at,
    source: {id: record.id, url: record.source, board_sha256: snapshotSha},
    decision,
    next_action_proposal: record.next,
    authority: "none",
    admission: "NONE",
    nonclaims: ["Not project disposition", "Not execution", "Not field proof", "Not third-party consent"]
  };
  return {...receipt, sha256: await sha256Text(JSON.stringify(receipt))};
}
