import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: "10mb" }));

  // Helper for lazy Gemini AI instance
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Sample data file path
  const sampleFilePath = path.join(process.cwd(), "src", "data", "customSample.json");

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Endpoint to save current form as the official sample data
  app.post("/api/save-sample", (req, res) => {
    try {
      const projectData = req.body;
      if (!projectData || !projectData.portada) {
        return res.status(400).json({ success: false, error: "Datos del proyecto inválidos" });
      }
      fs.mkdirSync(path.dirname(sampleFilePath), { recursive: true });
      fs.writeFileSync(sampleFilePath, JSON.stringify(projectData, null, 2), "utf-8");
      res.json({ success: true, message: "Información de ejemplo actualizada exitosamente en el servidor" });
    } catch (err: any) {
      console.error("Error al guardar ejemplo:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Endpoint to retrieve the current sample data
  app.get("/api/sample", (_req, res) => {
    try {
      if (fs.existsSync(sampleFilePath)) {
        const content = fs.readFileSync(sampleFilePath, "utf-8");
        return res.json({ success: true, data: JSON.parse(content) });
      }
      res.json({ success: false, message: "No custom sample found" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Image proxy route to prevent CORS issues when embedding images in PDF
  app.get("/api/image-proxy", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("Falta parámetro de URL de imagen");
    }
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(response.status).send("Error al descargar imagen remota");
      }
      const contentType = response.headers.get("content-type") || "image/jpeg";
      const arrayBuffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      res.status(500).send(err.message || "Error al solicitar imagen");
    }
  });

  // Gemini endpoint to generate or refine section content based on CUN guide prompt
  app.post("/api/gemini/generate-section", async (req, res) => {
    try {
      const { sectionKey, sectionTitle, userPrompt, currentContent, companyName } = req.body;
      
      const ai = getAI();
      const promptText = `
Eres un consultor experto en creación de empresas y asesor académico de la Corporación Unificada Nacional de Educación Superior (CUN) en Colombia.
Tu tarea es redactar el contenido académico y técnico para la sección "${sectionTitle}" (clave: ${sectionKey}) de la entrega final del proyecto de curso "Creación de Empresas III. Modelos de Innovación".

Nombre de la empresa o proyecto: ${companyName || 'Empresa en desarrollo'}
Contexto o instrucciones del usuario: ${userPrompt || 'Generar propuesta completa, rigurosa y alineada a las normas APA y requerimientos del proyecto CUN.'}
Contenido actual (si existe): ${currentContent || 'Ninguno'}

Requisitos según la Guía CUN:
- Debe mantener tono profesional, académico e investigativo bajo NORMAS APA.
- Debe incluir terminología técnica apropiada para la administración de empresas en Colombia (CIIU, Régimen Tributario, Estado de Resultados, etc. cuando aplique).
- Cumplir con restricciones de longitud especificadas en la guía (por ejemplo, Introducción mínimo 150 palabras, Descripción mínimo 200 palabras, Justificación máximo 5 líneas, etc.).
- Proporciona un texto listo para usar en la entrega final. Solo responde con el texto o contenido estructurado solicitado sin metatextos o introducciones fuera de lugar.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptText,
      });

      res.json({ success: true, text: response.text || "" });
    } catch (error: any) {
      console.error("Gemini section generation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error al generar contenido con IA",
      });
    }
  });

  // Gemini endpoint for APA text enhancement or grammar improvement
  app.post("/api/gemini/enhance-text", async (req, res) => {
    try {
      const { text, goal } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: "Texto no proporcionado" });
      }

      const ai = getAI();
      const promptText = `
Actúa como un corrector de estilo y editor académico especializado en Normas APA para la Universidad CUN Colombia.
Objetivo: ${goal || 'Mejorar la redacción, coherencia, ortografía y tono profesional manteniendo el sentido original.'}

Texto original:
"${text}"

Proporciona únicamente el texto mejorado y perfeccionado.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptText,
      });

      res.json({ success: true, text: response.text || text });
    } catch (error: any) {
      console.error("Gemini enhance text error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error al mejorar el texto",
      });
    }
  });

  // Vite middleware or static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
