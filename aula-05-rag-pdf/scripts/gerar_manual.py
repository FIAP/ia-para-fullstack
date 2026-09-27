"""Gera docs/manual.pdf: manual de uma loja FICTÍCIA, usado como base de conhecimento do RAG.

Os números (prazos, valores, horários) são específicos de propósito: assim dá para
conferir se a resposta veio do documento ou foi inventada pelo modelo.
"""
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

PAGINAS = [
    ("Manual do Cliente TechNova", [
        "A TechNova é uma loja online FICTÍCIA de eletrônicos, criada apenas para o curso IA para Devs. "
        "Nenhuma informação deste manual se refere a uma empresa real.",
        "Este manual reúne as regras que valem para todas as compras feitas no site: garantia, trocas e "
        "devoluções, frete e entrega, formas de pagamento, suporte ao cliente, assistência técnica e o "
        "programa de pontos. Em caso de dúvida, o time de atendimento usa este documento como referência oficial.",
        "Sumário: página 2, Política de Garantia; página 3, Trocas e Devoluções; página 4, Frete e Entrega; "
        "página 5, Formas de Pagamento; página 6, Suporte e Atendimento; página 7, Assistência Técnica; "
        "página 8, Programa de Pontos e Perguntas Frequentes.",
        "Versão 3.2 do manual, revisada pelo time de operações. As regras deste manual se somam aos direitos "
        "previstos no Código de Defesa do Consumidor e nunca os reduzem.",
    ]),
    ("Política de Garantia", [
        "Todos os produtos eletrônicos vendidos pela TechNova têm garantia total de 12 meses a partir da data "
        "de entrega. Esse prazo é a soma da garantia legal de 90 dias, prevista no Código de Defesa do "
        "Consumidor para bens duráveis, com a garantia contratual de 9 meses oferecida pelo fabricante.",
        "Acessórios, como capas, películas, cabos e carregadores, têm garantia total de 6 meses.",
        "No momento da compra, o cliente pode contratar a Garantia Estendida TechNova, que acrescenta 12 ou "
        "24 meses ao prazo original. A garantia estendida pode ser contratada até 30 dias após a entrega.",
        "A garantia não cobre danos causados por queda, contato com líquidos, oxidação, uso de carregadores "
        "não originais, violação do lacre ou reparo feito por assistência não autorizada.",
        "Para acionar a garantia, abra um protocolo na área Meus Pedidos do site, informe o número da nota "
        "fiscal e descreva o defeito. O protocolo é respondido em até 2 dias úteis com as instruções de envio.",
    ]),
    ("Trocas e Devoluções", [
        "Direito de arrependimento: em compras online, o cliente pode desistir da compra em até 7 dias corridos "
        "após o recebimento do produto, sem precisar justificar o motivo. O reembolso é feito em até 10 dias "
        "úteis após o produto chegar ao nosso centro de distribuição.",
        "Para devolução por arrependimento, o produto deve estar completo, com todos os acessórios e manuais, "
        "e de preferência na embalagem original. O frete de devolução é gratuito: enviamos um código de "
        "postagem para uso em qualquer agência dos Correios.",
        "Produto com defeito em até 7 dias após o recebimento é trocado por um novo, sem passar pela "
        "assistência técnica. Depois desse prazo, o produto com defeito segue o fluxo de assistência técnica "
        "descrito na página 7.",
        "O reembolso é feito na mesma forma de pagamento usada na compra. Em compras com cartão, o estorno "
        "pode aparecer em até duas faturas, conforme o fechamento do cartão.",
    ]),
    ("Frete e Entrega", [
        "Frete grátis: compras acima de R$ 299,00 têm frete grátis para as regiões Sul e Sudeste. Para as "
        "demais regiões, o frete é grátis em compras acima de R$ 499,00.",
        "Prazos de entrega padrão: de 2 a 4 dias úteis para capitais do Sudeste e de 5 a 12 dias úteis para "
        "as demais localidades. O prazo começa a contar após a confirmação do pagamento.",
        "Entrega expressa: disponível para capitais do Sudeste, custa R$ 29,90 e entrega em 1 dia útil para "
        "pedidos pagos até as 14h.",
        "O código de rastreamento é enviado por e-mail assim que o pedido é despachado. A transportadora faz "
        "até 3 tentativas de entrega. Depois da terceira tentativa sem sucesso, o pedido volta para a loja e "
        "o valor é reembolsado integralmente.",
    ]),
    ("Formas de Pagamento", [
        "Cartão de crédito: parcelamento em até 10 vezes sem juros, com parcela mínima de R$ 50,00. "
        "Aceitamos as principais bandeiras.",
        "Pix: pagamentos via Pix têm 5% de desconto sobre o valor dos produtos e são aprovados na hora. "
        "O desconto não se aplica ao valor do frete.",
        "Boleto bancário: o boleto vence em 3 dias úteis e a aprovação leva até 2 dias úteis após o pagamento. "
        "Pedidos com boleto vencido são cancelados automaticamente.",
        "Por segurança, a TechNova nunca pede senha, código de verificação ou dados completos do cartão por "
        "telefone, e-mail ou WhatsApp.",
    ]),
    ("Suporte e Atendimento", [
        "Chat no site: de segunda a sexta, das 8h às 20h, e aos sábados, das 9h às 14h. Não há atendimento "
        "aos domingos e feriados nacionais.",
        "E-mail: suporte@technova.exemplo, com resposta em até 24 horas úteis.",
        "Telefone: 0800 000 0000 (número fictício), de segunda a sexta, das 9h às 18h.",
        "Pedidos com problema de entrega ou cobrança em duplicidade têm prioridade no atendimento e recebem "
        "a primeira resposta em até 4 horas úteis.",
        "Todo atendimento gera um número de protocolo, enviado por e-mail, que deve ser informado em "
        "qualquer contato posterior sobre o mesmo assunto.",
    ]),
    ("Assistência Técnica", [
        "Os reparos em garantia são feitos pela rede de assistências autorizadas pelo fabricante ou pelo "
        "laboratório próprio da TechNova, em São Paulo.",
        "O prazo máximo de reparo é de 30 dias corridos a partir do recebimento do produto pela assistência. "
        "Se o reparo não for concluído nesse prazo, o cliente pode escolher entre a troca por um produto novo, "
        "o reembolso integral ou o abatimento proporcional do preço.",
        "Para notebooks, se o reparo passar de 15 dias, a TechNova empresta um notebook reserva até a "
        "devolução do equipamento.",
        "Antes de enviar o produto, faça backup dos seus dados: a assistência pode precisar restaurar o "
        "equipamento para as configurações de fábrica. A TechNova não se responsabiliza por dados perdidos.",
    ]),
    ("Programa de Pontos e Perguntas Frequentes", [
        "Programa de pontos: cada R$ 1,00 gasto em produtos vale 1 ponto. A cada 100 pontos, o cliente pode "
        "trocar por R$ 5,00 de desconto em uma nova compra. Os pontos expiram em 12 meses.",
        "Posso retirar o pedido numa loja física? Não. A TechNova é uma loja exclusivamente online e não "
        "possui lojas físicas.",
        "Vocês emitem nota fiscal? Sim. A nota fiscal eletrônica é enviada por e-mail junto com a "
        "confirmação de despacho do pedido.",
        "Posso mudar o endereço de entrega depois da compra? Sim, desde que o pedido ainda não tenha sido "
        "despachado. Solicite a alteração pelo chat.",
    ]),
]

destino = Path(__file__).resolve().parent.parent / "docs" / "manual.pdf"
destino.parent.mkdir(exist_ok=True)

estilos = getSampleStyleSheet()
elementos = []
for i, (titulo, paragrafos) in enumerate(PAGINAS):
    elementos.append(Paragraph(titulo, estilos["Title"] if i == 0 else estilos["Heading1"]))
    elementos.append(Spacer(1, 12))
    for p in paragrafos:
        elementos.append(Paragraph(p, estilos["BodyText"]))
        elementos.append(Spacer(1, 10))
    if i < len(PAGINAS) - 1:
        elementos.append(PageBreak())  # uma seção por página, para a citação de página fazer sentido

SimpleDocTemplate(str(destino), pagesize=A4, title="Manual do Cliente TechNova (fictício)").build(elementos)
print(f"PDF gerado: {destino} ({len(PAGINAS)} páginas)")
