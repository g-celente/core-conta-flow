package com.fincore.pattern.validacao;

import com.fincore.domain.TituloPagar;

/** Decorator — ConcreteDecorator: exige rateio de exatamente 100% (feature centro_custo). */
public class ValidacaoRateio extends ValidacaoDecorator {

    public ValidacaoRateio(ValidadorTitulo validador) {
        super(validador);
    }

    @Override
    public ResultadoValidacao validar(TituloPagar titulo) {
        ResultadoValidacao resultado = super.validar(titulo);
        if (!titulo.getRateio().estaCompleto()) {
            resultado.adicionarErro("rateio", "O rateio precisa somar exatamente 100% para salvar.");
        }
        return resultado;
    }
}
