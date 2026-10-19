import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {checkBoard,sha256Text,localSelection} from "./engine.mjs";
const board=JSON.parse(readFileSync(new URL("./board.json",import.meta.url),"utf8"));
test("projection has valid lanes and unique source-linked identities",()=>{
  assert.equal(checkBoard(board),true);
  assert.equal(board.records.length,3);
  assert.ok(board.records.every(r=>r.source.startsWith("https://github.com/")));
});
test("authority cannot be laundered through a display card",()=>{
  assert.throws(()=>checkBoard({...board,authority:"owner"}));
  assert.throws(()=>checkBoard({...board,records:[...board.records,board.records[0]]}));
});
test("exact bytes are hashed and choices do not become execution",async()=>{
  assert.equal(await sha256Text("abc"),"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  const a=await localSelection(board.records[0],"SELECT_FOR_REVIEW","a".repeat(64),"2026-10-19T12:00:00.000Z");
  const b=await localSelection(board.records[0],"SELECT_FOR_REVIEW","a".repeat(64),"2026-10-19T12:00:00.000Z");
  assert.deepEqual(a,b);
  assert.equal(a.authority,"none");assert.equal(a.admission,"NONE");
  await assert.rejects(localSelection(board.records[0],"ADMIT","a".repeat(64),"2026-10-19T12:00:00.000Z"));
});
