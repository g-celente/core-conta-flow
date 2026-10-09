package com.fincore.domain;

import java.util.List;

/** Arquivo bancário recebido para importação. */
public class ArquivoExtrato {
    private final String nome;
    private final String conteudo;

    public ArquivoExtrato(String nome, String conteudo) {
        this.nome = nome;
        this.conteudo = conteudo;
    }

    public String getNome() {
        return nome;
    }

    public String getConteudo() {
        return conteudo;
    }

    public boolean temExtensao(String extensao) {
        return nome.toLowerCase().endsWith(extensao);
    }

    /** Uma entrada por linha do arquivo. */
    public List<String> registros() {
        return List.of(conteudo.split("\n"));
    }
}
