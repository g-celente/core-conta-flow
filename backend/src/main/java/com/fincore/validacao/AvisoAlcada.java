package com.fincore.validacao;

import com.fincore.Moeda;
import com.fincore.dominio.Alcada;
import com.fincore.dominio.TituloPagar;

/** Decorator — ConcreteDecorator: avisa quando o valor passa da alçada (feature alcada). */
public class AvisoAlcada extends ValidacaoDecorator {
    private final Alcada alcada;

    public AvisoAlcada(ValidadorTitulo validador, Alcada alcada) {
        super(validador);
        this.alcada = alcada;
    }

    @Override
    public ResultadoValidacao validar(TituloPagar titulo) {
        ResultadoValidacao resultado = super.validar(titulo);
        if (alcada.exigeAprovacao(titulo.getValor())) {
            resultado.adicionarAviso(
                    "Acima da alçada de " + Moeda.brl(alcada.getLimite()) + " — irá para a fila de aprovação.");
        }
        return resultado;
    }
}
