import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEY } from "../config.js";

// Edits live in this browser only: { "<voter no>": { field: newValue, ... } }
export function useEdits() {
  const [edits, setEdits] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {}; } catch { return {}; }
  });
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(edits)); setSaveFailed(false); }
    catch { setSaveFailed(true); }
  }, [edits]);

  const setOne = useCallback((no, diff) => setEdits((e) => {
    const next = { ...e };
    if (diff && Object.keys(diff).length) next[no] = diff; else delete next[no];
    return next;
  }), []);

  return { edits, setEdits, setOne, saveFailed };
}

export const current = (orig, edits) => (edits[orig.gp_serial_no] ? { ...orig, ...edits[orig.gp_serial_no] } : orig);
