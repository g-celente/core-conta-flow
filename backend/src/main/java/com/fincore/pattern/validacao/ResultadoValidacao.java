package com.fincore.pattern.validacao;

import java.util.ArrayList;
import java.util.List;

/** Decorator — auxiliar: erros e avisos acumulados pelas camadas de validação. */
public class ResultadoValidacao {

    /** Erro ligado a um campo do formulário. */
    public record Erro(String campo, String mensagem) {}

    private final List<Erro> erros = new ArrayList<>();
    private final List<String> avisos = new ArrayList<>();

    public List<Erro> getErros() {
        return erros;
    }

    public List<String> getAvisos() {
        return avisos;
    }

    /** Erros bloqueiam o salvamento; avisos só informam. */
    public boolean podeSalvar() {
        return erros.isEmpty();
    }

    public void adicionarErro(String campo, String mensagem) {
        erros.add(new Erro(campo, mensagem));
    }

    public void adicionarAviso(String mensagem) {
        avisos.add(mensagem);
    }
}
