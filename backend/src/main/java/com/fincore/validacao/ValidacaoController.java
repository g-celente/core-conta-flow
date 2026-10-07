package com.fincore.validacao;

import com.fincore.dominio.Alcada;
import com.fincore.dominio.AlcadaRepository;
import com.fincore.dominio.ConfiguracaoTenant;
import com.fincore.dominio.LinhaRateio;
import com.fincore.dominio.Rateio;
import com.fincore.dominio.TituloPagar;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Decorator — cliente: cada feature contratada envolve o validador do núcleo com a sua regra. */
@RestController
@RequestMapping("/api/titulos")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ValidacaoController {
    private final AlcadaRepository alcadas;

    public ValidacaoController(AlcadaRepository alcadas) {
        this.alcadas = alcadas;
    }

    public record LinhaRateioDados(String centroId, double percentual) {}

    public record TituloDados(String documento, String parceiroId, String vencimento, double valor,
            List<LinhaRateioDados> rateio) {}

    public record PedidoValidacao(TituloDados titulo, List<String> features) {}

    public record Validacao(List<ResultadoValidacao.Erro> erros, List<String> avisos, boolean podeSalvar) {}

    @PostMapping("/validar")
    public Validacao validar(@RequestBody PedidoValidacao pedido) {
        ConfiguracaoTenant tenant = new ConfiguracaoTenant(pedido.features());

        ValidadorTitulo validador = new ValidacaoCamposObrigatorios();
        if (tenant.possui("centro_custo")) {
            validador = new ValidacaoRateio(validador);
        }
        List<Alcada> escada = alcadas.findAllByOrderByLimiteAsc();
        if (tenant.possui("alcada") && !escada.isEmpty()) {
            // O aviso usa a primeira alçada da escada (a do operador).
            validador = new AvisoAlcada(validador, escada.getFirst());
        }

        ResultadoValidacao resultado = validador.validar(paraTitulo(pedido.titulo()));
        return new Validacao(resultado.getErros(), resultado.getAvisos(), resultado.podeSalvar());
    }

    private TituloPagar paraTitulo(TituloDados dados) {
        Rateio rateio = new Rateio(dados.rateio().stream()
                .map(linha -> new LinhaRateio(linha.centroId(), linha.percentual()))
                .toList());
        return new TituloPagar(dados.documento(), dados.parceiroId(), dados.vencimento(), dados.valor(), rateio);
    }
}
