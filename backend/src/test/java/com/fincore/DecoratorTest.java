package com.fincore;

import com.fincore.domain.Alcada;
import com.fincore.domain.LinhaRateio;
import com.fincore.domain.Rateio;
import com.fincore.domain.TituloPagar;
import com.fincore.pattern.baixa.AbatimentoDesconto;
import com.fincore.pattern.baixa.AcrescimoJurosMulta;
import com.fincore.pattern.baixa.ValorAPagar;
import com.fincore.pattern.baixa.ValorOriginal;
import com.fincore.pattern.validacao.AvisoAlcada;
import com.fincore.pattern.validacao.ResultadoValidacao;
import com.fincore.pattern.validacao.ValidacaoCamposObrigatorios;
import com.fincore.pattern.validacao.ValidacaoRateio;
import com.fincore.pattern.validacao.ValidadorTitulo;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class DecoratorTest {

    @Test
    void jurosEDescontoEnvolvemOValorOriginal() {
        ValorAPagar valor = new AbatimentoDesconto(
                new AcrescimoJurosMulta(new ValorOriginal(new TituloPagar("NF-20491", 14502.33)), 435.07), 100);

        assertThat(valor.valor()).isEqualTo(14837.40);
        assertThat(valor.composicao()).hasSize(3);
        assertThat(valor.composicao().get(0)).startsWith("Valor original do título NF-20491").contains("14.502,33");
        assertThat(valor.composicao().get(1)).startsWith("(+) Juros / multa").contains("435,07");
        assertThat(valor.composicao().get(2)).startsWith("(−) Desconto").contains("100,00");
    }

    @Test
    void rateioIncompletoGeraErroEValorAcimaDaAlcadaGeraAviso() {
        ValidadorTitulo validador = new AvisoAlcada(
                new ValidacaoRateio(new ValidacaoCamposObrigatorios()),
                new Alcada("Operador financeiro", "Marina Duarte", 10000));
        TituloPagar titulo = new TituloPagar("NF-7788", "pa-6", "15/07/2026", 12000,
                new Rateio(List.of(new LinhaRateio("cc-4", 70))));

        ResultadoValidacao resultado = validador.validar(titulo);

        assertThat(resultado.getErros()).extracting(ResultadoValidacao.Erro::campo).containsExactly("rateio");
        assertThat(resultado.getAvisos()).singleElement().asString().contains("10.000,00");
        assertThat(resultado.podeSalvar()).isFalse();
    }

    @Test
    void semDecoradoresSoAsRegrasDoNucleo() {
        ResultadoValidacao resultado = new ValidacaoCamposObrigatorios()
                .validar(new TituloPagar("", "", "", 0, new Rateio(List.of(new LinhaRateio("cc-1", 30)))));

        assertThat(resultado.getErros()).extracting(ResultadoValidacao.Erro::campo)
                .containsExactly("documento", "parceiroId", "vencimento", "valor");
        assertThat(resultado.getAvisos()).isEmpty();
    }
}
