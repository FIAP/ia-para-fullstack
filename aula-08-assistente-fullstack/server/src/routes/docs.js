import { Router } from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { dividir } from "../rag/dividir.js";

// multer guarda o arquivo em memória (req.file.buffer): não sobra nada em disco.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB: limite de proteção contra uploads gigantes
  fileFilter: (_req, arquivo, ok) => ok(null, arquivo.mimetype === "application/pdf"),
});

export function rotaDocs({ rag, auth }) {
  const router = Router();

  router.post("/docs", auth, upload.single("pdf"), async (req, res) => {
    if (!req.file) return res.status(400).json({ erro: "Envie um PDF no campo 'pdf'" });

    // Extraímos o texto POR PÁGINA, para poder citar a fonte na resposta (Aula 5).
    const parser = new PDFParse({ data: req.file.buffer });
    const { pages } = await parser.getText();
    await parser.destroy();

    const chunks = pages.flatMap((p) =>
      dividir(p.text, 800, 100).map((texto) => ({ texto, arquivo: req.file.originalname, pagina: p.num })),
    );
    if (chunks.length === 0) return res.status(422).json({ erro: "O PDF não tem texto extraível" });

    await rag.indexar(`user_${req.user.id}`, chunks);
    res.status(201).json({ arquivo: req.file.originalname, paginas: pages.length, chunks: chunks.length });
  });

  return router;
}
