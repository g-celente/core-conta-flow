package com.fincore.pattern.validacao;

import com.fincore.domain.TituloPagar;

/** Decorator — ConcreteComponent: regras do núcleo, válidas em qualquer tenant. */
public class ValidacaoCamposObrigatorios implements ValidadorTitulo {

    public ResultadoValidacao validar(TituloPagar titulo) {
        ResultadoValidacao resultado = new ResultadoValidacao();
        if (titulo.getDocumento().isBlank()) {
            resultado.adicionarErro("documento", "Informe o documento.");
        }
        if (titulo.getParceiroId().isBlank()) {
            resultado.adicionarErro("parceiroId", "Selecione o fornecedor.");
        }
        if (titulo.getVencimento().isBlank()) {
            resultado.adicionarErro("vencimento", "Informe o vencimento.");
        }
        if (!titulo.temValorPositivo()) {
            resultado.adicionarErro("valor", "Informe um valor maior que zero.");
        }
        return resultado;
    }
}
