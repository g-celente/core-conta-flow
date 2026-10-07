package com.fincore.validacao;

import com.fincore.dominio.TituloPagar;

/** Decorator — Component: contrato de validação do título a pagar. */
public interface ValidadorTitulo {
    ResultadoValidacao validar(TituloPagar titulo);
}
