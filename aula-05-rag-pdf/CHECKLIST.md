# Checklist da prática · Aula 5

- [ ] PDF carregado: um Document por página, com metadados
- [ ] Chunks com overlap (`RecursiveCharacterTextSplitter`)
- [ ] Embeddings salvos no Chroma, persistido em disco (sem reprocessar a cada execução)
- [ ] Busca testada **isoladamente**, antes de envolver o LLM
- [ ] Prompt restritivo: só os trechos, "não sei" quando não houver resposta, fonte citada
- [ ] Temperatura 0
- [ ] Fonte citada ("Fonte: página X")
- [ ] "Não há informação" para pergunta fora do documento
- [ ] Experimento de tamanho de chunk
- [ ] Golden dataset rodado depois de cada mudança (chunking, k, prompt ou modelo)
