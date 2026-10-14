package com.fincore.pattern.validacao;

import com.fincore.domain.TituloPagar;

/** Decorator — Component: contrato de validação do título a pagar. */
public interface ValidadorTitulo {
    ResultadoValidacao validar(TituloPagar titulo);
}
