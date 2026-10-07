package com.fincore.cadastro;

import jakarta.persistence.Embeddable;

/** Item do histórico de um cadastro: quando, quem e o quê. */
@Embeddable
public class Alteracao {
    private String data;
    private String usuario;
    private String descricao;

    /** Exigido pelo JPA. */
    protected Alteracao() {
    }

    public String getData() {
        return data;
    }

    public String getUsuario() {
        return usuario;
    }

    public String getDescricao() {
        return descricao;
    }
}
