export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export async function createEstablishment(payload) {
  const res = await fetch(`${API_BASE}/establishments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error || body?.detail || JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || "Failed to create establishment");
  }
  return res.json();
}

export async function fetchEstablishments(zip) {
  const res = await fetch(`${API_BASE}/establishments?zip=${encodeURIComponent(zip)}`);
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error || body?.detail || JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || "Failed to fetch establishments");
  }
  return res.json();
}

export async function submitRating(payload) {
  const form = new FormData();
  form.append("establishmentId", payload.establishmentId);
  form.append("lighting", payload.lighting);
  form.append("acoustics", payload.acoustics);
  form.append("tableDensity", payload.tableDensity);
  form.append("roadNoise", payload.roadNoise);
  form.append("seatingComfort", payload.seatingComfort);
  if (payload.note) form.append("note", payload.note);
  if (payload.photo) form.append("photo", payload.photo);

  const res = await fetch(`${API_BASE}/ratings`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error || body?.detail || JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || "Failed to submit rating");
  }

  return res.json();
}

export async function fetchRecentPhotos(establishmentId) {
  const res = await fetch(
    `${API_BASE}/ratings/recent?establishmentId=${encodeURIComponent(establishmentId)}`
  );
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error || body?.detail || JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || "Failed to fetch photos");
  }
  return res.json();
}

export async function submitFlag(payload) {
  const res = await fetch(`${API_BASE}/ratings/flags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error || body?.detail || JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || "Failed to submit flag");
  }
  return res.json();
}

export async function submitProblemReport(payload) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error || body?.detail || JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || "Failed to submit report");
  }
  return res.json();
}
