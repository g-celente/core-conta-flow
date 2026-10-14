package com.fincore.domain;

/** Linha lida de um extrato bancário; `erro` é null quando a linha é válida. */
public class LinhaExtrato {
    private final int linha;
    private final String data;
    private final String descricao;
    private final double valor;
    private final String tipo;
    private final String erro;

    public LinhaExtrato(int linha, String data, String descricao, double valor, String tipo) {
        this(linha, data, descricao, valor, tipo, null);
    }

    private LinhaExtrato(int linha, String data, String descricao, double valor, String tipo, String erro) {
        this.linha = linha;
        this.data = data;
        this.descricao = descricao;
        this.valor = valor;
        this.tipo = tipo;
        this.erro = erro;
    }

    public int getLinha() {
        return linha;
    }

    public String getData() {
        return data;
    }

    public String getDescricao() {
        return descricao;
    }

    public double getValor() {
        return valor;
    }

    public String getTipo() {
        return tipo;
    }

    public String getErro() {
        return erro;
    }

    public boolean ehValida() {
        return erro == null;
    }

    /** Devolve uma cópia da linha marcada como rejeitada. */
    public LinhaExtrato rejeitar(String motivo) {
        return new LinhaExtrato(linha, data, descricao, valor, tipo, motivo);
    }
}
