import topics from "../data/demoData";

// ── Local-only topic picker (no API call) ──
export function getLocalTopic(course) {
  let normCourse = (course || "").toLowerCase().trim();
  if (normCourse.startsWith("random_")) normCourse = normCourse.replace("random_", "");

  // Check if it's one of the exact categories from demoData
  const hasExact = topics.some(t => (t.category || "").toLowerCase() === normCourse);
  if (hasExact) {
    const filtered = topics.filter(t => (t.category || "").toLowerCase() === normCourse);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  let categoryKey = "general";
  if (normCourse === "acca" || normCourse === "cma" || normCourse === "financial" || normCourse === "finance") {
    categoryKey = "finance";
  } else if (normCourse === "bank" || normCourse === "banking" || normCourse === "business") {
    categoryKey = "business";
  } else if (normCourse === "movie" || normCourse === "movies") {
    categoryKey = "movies";
  } else if (["sports","anime","science","history","technology","food","countries","medicine","programming","music"].includes(normCourse)) {
    categoryKey = normCourse;
  }

  const filtered = topics.filter((t) => {
    const cat = (t.category || "").toLowerCase();
    if (categoryKey === "finance") return cat === "finance" || cat === "financial";
    if (categoryKey === "business") return cat === "business" || cat === "bank" || cat === "banking";
    if (categoryKey === "movies") return cat === "movies" || cat === "movie";
    return cat === categoryKey;
  });
  const pool = filtered.length > 0 ? filtered : topics;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Async wrapper to keep compatibility with existing code calling generateTopic() ──
export async function generateTopic(course) {
  return getLocalTopic(course);
}
