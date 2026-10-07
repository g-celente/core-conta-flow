package com.fincore.validacao;

import com.fincore.dominio.TituloPagar;

/**
 * Decorator — Decorator: guarda o validador envolvido e repassa a chamada; cada regra concreta
 * valida por cima do resultado recebido.
 */
public abstract class ValidacaoDecorator implements ValidadorTitulo {
    protected final ValidadorTitulo validador;

    protected ValidacaoDecorator(ValidadorTitulo validador) {
        this.validador = validador;
    }

    public ResultadoValidacao validar(TituloPagar titulo) {
        return validador.validar(titulo);
    }
}
