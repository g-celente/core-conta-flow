package com.fincore.service;

import com.fincore.domain.Alcada;
import com.fincore.domain.ConfiguracaoTenant;
import com.fincore.domain.TituloPagar;
import com.fincore.pattern.validacao.AvisoAlcada;
import com.fincore.pattern.validacao.ResultadoValidacao;
import com.fincore.pattern.validacao.ValidacaoCamposObrigatorios;
import com.fincore.pattern.validacao.ValidacaoRateio;
import com.fincore.pattern.validacao.ValidadorTitulo;
import com.fincore.repository.AlcadaRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** Decorator — cliente: cada feature contratada envolve o validador do núcleo com a sua regra. */
@Service
public class ValidacaoService {
    private final AlcadaRepository alcadas;

    public ValidacaoService(AlcadaRepository alcadas) {
        this.alcadas = alcadas;
    }

    public ResultadoValidacao validar(TituloPagar titulo, List<String> features) {
        ConfiguracaoTenant tenant = new ConfiguracaoTenant(features);
        ValidadorTitulo validador = new ValidacaoCamposObrigatorios();
        if (tenant.possui("centro_custo")) {
            validador = new ValidacaoRateio(validador);
        }
        List<Alcada> escada = alcadas.findAllByOrderByLimiteAsc();
        if (tenant.possui("alcada") && !escada.isEmpty()) {
            // O aviso usa a primeira alçada da escada (a do operador).
            validador = new AvisoAlcada(validador, escada.getFirst());
        }
        return validador.validar(titulo);
    }
}
