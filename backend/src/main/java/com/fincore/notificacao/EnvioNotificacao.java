package com.fincore.notificacao;

/** Chain of Responsibility — resposta do canal que entregou o aviso (o push corta, o e-mail prefixa). */
public record EnvioNotificacao(String canal, String destinatario, String mensagem, String hora) {}
