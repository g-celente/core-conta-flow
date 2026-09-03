/**
 * Contrato entre o módulo de comissões e o núcleo do FinCore.
 *
 * O módulo NÃO conhece o tipo `TituloPagar` do núcleo. Ele declara aqui a
 * forma mínima do que precisa enviar e receber. Quem faz a ponte é a rota,
 * que injeta uma implementação dessas funções vinda do núcleo.
 */

/** Dados que o módulo envia ao núcleo para gerar um título a pagar. */
export type SolicitacaoTitulo = {
  documento: string;
  fornecedor: string;
  valor: number;
  vencimento: string;
  categoria: string;
  origem: string;
};

/** Confirmação devolvida pelo núcleo após criar o título. */
export type TituloCriado = { id: string; documento: string };

/** Porta de saída do módulo: assinatura que o núcleo deve fornecer. */
export type PortaNucleo = {
  lancarTitulo: (dados: SolicitacaoTitulo) => TituloCriado;
  /** Nome do usuário logado, para o registro de auditoria. */
  usuario: string;
  /** Registra o evento na trilha de auditoria do núcleo. */
  auditar: (operacao: string, detalhe: string) => void;
};
