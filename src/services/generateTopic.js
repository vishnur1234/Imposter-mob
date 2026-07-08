import ai from "./gemini";
import topics from "../data/demoData";

export async function generateTopic(course) {
  // Normalize the category selection for offline demo data fallback
  let normCourse = (course || "").toLowerCase().trim();
  if (normCourse.startsWith("random_")) {
    normCourse = normCourse.replace("random_", "");
  }

  let categoryKey = "general";
  
  if (normCourse === "acca" || normCourse === "cma" || normCourse === "financial" || normCourse === "finance") {
    categoryKey = "finance";
  } else if (normCourse === "bank" || normCourse === "banking" || normCourse === "business") {
    categoryKey = "business";
  } else if (normCourse === "movie" || normCourse === "movies") {
    categoryKey = "movies";
  } else if (
    ["sports", "anime", "science", "history", "technology", "food", "countries", "medicine", "programming", "music"].includes(normCourse)
  ) {
    categoryKey = normCourse;
  }

  if (!ai) {
    console.warn("Gemini API key is not configured. Falling back to local demo data.");
    const filteredTopics = topics.filter((t) => t.category === categoryKey);
    const useTopics = filteredTopics.length > 0 ? filteredTopics : topics;
    const randomIndex = Math.floor(Math.random() * useTopics.length);
    return useTopics[randomIndex];
  }

  try {
    let cleanCourse = course;
    if (typeof course === "string" && course.startsWith("random_")) {
      cleanCourse = course.replace("random_", "");
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Generate one imposter game topic from the "${cleanCourse}" category.

Rules:
- If the category is Finance or Business, generate finance, accounting, or corporate business topics (e.g. compound interest, capital gains, collateral, monopoly, venture capital, etc.).
- If the category is Movies, generate popular movies, characters, or cinema concepts (e.g. Inception, Titanic, The Matrix, Avatar, etc.).
- If the category is Sports, generate specific sports, positions, techniques, or events (e.g. Soccer, Basketball, Tennis, Formula 1, etc.).
- If the category is Anime, generate popular anime series or characters (e.g. Naruto, One Piece, Attack on Titan, Death Note, etc.).
- If the category is Science, generate fundamental scientific concepts, physics laws, biological processes, or chemistry terms (e.g. Photosynthesis, Black Hole, DNA, Quantum Mechanics, etc.).
- If the category is History, generate famous historical events, figures, or eras (e.g. French Revolution, Julius Caesar, Cold War, Renaissance, etc.).
- If the category is Technology, generate digital or hardware tech concepts (e.g. Artificial Intelligence, Blockchain, Cloud Computing, Virtual Reality, etc.).
- If the category is Food, generate popular meals, ingredients, or cooking styles (e.g. Pizza, Sushi, Chocolate, Ice Cream, etc.).
- If the category is Countries, generate countries of the world (e.g. Japan, France, Brazil, Egypt, India, Canada, etc.).
- If the category is Medicine, generate biological, medical, surgical, or pathological terms (e.g. Antibiotics, Anesthesia, Vaccine, Stethoscope, etc.).
- If the category is Programming, generate developer languages, concepts, or structures (e.g. Python, JavaScript, Compiler, Database, Recursion, etc.).
- If the category is Music, generate instruments, genres, famous bands, or theory terms (e.g. Guitar, Piano, Jazz, Opera, Symphony, etc.).
- Give only ONE clue.
- The clue should help the imposter guess the answer without being too obvious to everyone immediately.
- Return ONLY valid JSON matching this schema:

{
  "answer": "",
  "clue": ""
}
`,
      config: {
        responseMimeType: "application/json",
      },
    });

    let cleanText = response.text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, "").replace(/```$/, "").trim();
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini API call failed, falling back to local demo data:", error);
    const filteredTopics = topics.filter((t) => t.category === categoryKey);
    const useTopics = filteredTopics.length > 0 ? filteredTopics : topics;
    const randomIndex = Math.floor(Math.random() * useTopics.length);
    return useTopics[randomIndex];
  }
}
