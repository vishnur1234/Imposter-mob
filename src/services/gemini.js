import { GoogleGenAI } from "@google/genai";

const apiKey = "AQ.Ab8RN6JcA2Kl6ARbLlB2fnBJC00tqRuKyNRbdByu3Ddmx4x6fg";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default ai;
