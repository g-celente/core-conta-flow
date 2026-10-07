package com.fincore.dominio;

/** Aviso a ser entregue a um usuário por algum canal. */
public class Notificacao {
    private final String destinatario;
    private final String mensagem;
    private final String evento;

    public Notificacao(String destinatario, String mensagem, String evento) {
        this.destinatario = destinatario;
        this.mensagem = mensagem;
        this.evento = evento;
    }

    public String getDestinatario() {
        return destinatario;
    }

    public String getMensagem() {
        return mensagem;
    }

    public String getEvento() {
        return evento;
    }

    /** A mensagem cortada no limite de caracteres, com reticências. */
    public String resumo(int limite) {
        return mensagem.length() <= limite ? mensagem : mensagem.substring(0, limite - 1) + "…";
    }
}
