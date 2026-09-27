import { createParser } from "eventsource-parser";

// Lê um corpo SSE ("data: <json>" ... "data: [DONE]") e chama aoReceber a cada token.
// O eventsource-parser cuida do chato: eventos que chegam partidos entre dois pedaços da rede.
export async function lerStreamSSE(corpo: ReadableStream<Uint8Array>, aoReceber: (token: string) => void) {
  let terminou = false;
  const parser = createParser({
    onEvent(e) {
      if (e.data === "[DONE]") {
        terminou = true;
        return;
      }
      aoReceber(JSON.parse(e.data) as string);
    },
  });

  const reader = corpo.getReader();
  const decoder = new TextDecoder();
  while (!terminou) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.feed(decoder.decode(value, { stream: true }));
  }
}
