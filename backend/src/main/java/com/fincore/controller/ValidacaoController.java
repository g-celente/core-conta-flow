package com.fincore.controller;

import com.fincore.domain.LinhaRateio;
import com.fincore.domain.Rateio;
import com.fincore.domain.TituloPagar;
import com.fincore.pattern.validacao.ResultadoValidacao;
import com.fincore.service.ValidacaoService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Validação do título; o Decorator é usado no ValidacaoService. */
@RestController
@RequestMapping("/api/titulos")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ValidacaoController {
    private final ValidacaoService validacao;

    public ValidacaoController(ValidacaoService validacao) {
        this.validacao = validacao;
    }

    public record LinhaRateioDados(String centroId, double percentual) {}

    public record TituloDados(String documento, String parceiroId, String vencimento, double valor,
            List<LinhaRateioDados> rateio) {}

    public record PedidoValidacao(TituloDados titulo, List<String> features) {}

    public record Validacao(List<ResultadoValidacao.Erro> erros, List<String> avisos, boolean podeSalvar) {}

    @PostMapping("/validar")
    public Validacao validar(@RequestBody PedidoValidacao pedido) {
        ResultadoValidacao resultado = validacao.validar(paraTitulo(pedido.titulo()), pedido.features());
        return new Validacao(resultado.getErros(), resultado.getAvisos(), resultado.podeSalvar());
    }

    private TituloPagar paraTitulo(TituloDados dados) {
        Rateio rateio = new Rateio(dados.rateio().stream()
                .map(linha -> new LinhaRateio(linha.centroId(), linha.percentual()))
                .toList());
        return new TituloPagar(dados.documento(), dados.parceiroId(), dados.vencimento(), dados.valor(), rateio);
    }
}
