package com.fincore.controller;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Erros de regra (ex.: extensão de arquivo errada) viram HTTP 400 com a mensagem. */
@RestControllerAdvice
public class TratamentoDeErros {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> erroDeRegra(IllegalArgumentException erro) {
        return Map.of("mensagem", erro.getMessage());
    }
}
