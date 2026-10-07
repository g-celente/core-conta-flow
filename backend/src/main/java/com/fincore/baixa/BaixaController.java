package com.fincore.baixa;

import com.fincore.dominio.BaixaTitulo;
import com.fincore.dominio.TituloPagar;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Decorator — cliente: envolve o valor original com um decorador para cada ajuste informado. */
@RestController
@RequestMapping("/api/baixa")
@CrossOrigin(originPatterns = "http://localhost:*")
public class BaixaController {

    public record PedidoValorDevido(String documento, double valor, double juros, double desconto) {}

    public record ValorDevido(double total, List<String> composicao) {}

    @PostMapping("/valor-devido")
    public ValorDevido valorDevido(@RequestBody PedidoValorDevido pedido) {
        TituloPagar titulo = new TituloPagar(pedido.documento(), pedido.valor());
        BaixaTitulo baixa = new BaixaTitulo(pedido.juros(), pedido.desconto());

        ValorAPagar valor = new ValorOriginal(titulo);
        if (baixa.temJuros()) {
            valor = new AcrescimoJurosMulta(valor, baixa.getJuros());
        }
        if (baixa.temDesconto()) {
            valor = new AbatimentoDesconto(valor, baixa.getDesconto());
        }
        return new ValorDevido(valor.valor(), valor.composicao());
    }
}
