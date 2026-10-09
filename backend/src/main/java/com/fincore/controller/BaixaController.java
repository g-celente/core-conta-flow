package com.fincore.controller;

import com.fincore.domain.BaixaTitulo;
import com.fincore.domain.TituloPagar;
import com.fincore.pattern.baixa.ValorAPagar;
import com.fincore.service.BaixaService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Valor devido na baixa; o Decorator é usado no BaixaService. */
@RestController
@RequestMapping("/api/baixa")
@CrossOrigin(originPatterns = "http://localhost:*")
public class BaixaController {
    private final BaixaService baixa;

    public BaixaController(BaixaService baixa) {
        this.baixa = baixa;
    }

    public record PedidoValorDevido(String documento, double valor, double juros, double desconto) {}

    public record ValorDevido(double total, List<String> composicao) {}

    @PostMapping("/valor-devido")
    public ValorDevido valorDevido(@RequestBody PedidoValorDevido pedido) {
        ValorAPagar valor = baixa.valorDevido(new TituloPagar(pedido.documento(), pedido.valor()),
                new BaixaTitulo(pedido.juros(), pedido.desconto()));
        return new ValorDevido(valor.valor(), valor.composicao());
    }
}
