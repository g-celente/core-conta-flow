package com.fincore.pattern.aprovacao;

/**
 * Chain of Responsibility — resposta do elo que assumiu o pedido. `exigeFila` é false quando o
 * próprio solicitante tem alçada: o título entra direto como "Em aberto".
 */
public record DecisaoAprovacao(String nivel, String responsavel, boolean exigeFila, String motivo) {}
