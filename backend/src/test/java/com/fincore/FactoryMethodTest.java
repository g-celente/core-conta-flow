package com.fincore;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fincore.dominio.ArquivoExtrato;
import com.fincore.dominio.ContaPlano;
import com.fincore.dominio.LinhaExtrato;
import com.fincore.extrato.AmostrasExtrato;
import com.fincore.extrato.ImportadorCnab240;
import com.fincore.extrato.ImportadorCnab400;
import com.fincore.extrato.ImportadorExtrato;
import com.fincore.extrato.ImportadorOfx;
import com.fincore.extrato.LeitorOfx;
import com.fincore.planodecontas.EnquadramentoLucroReal;
import com.fincore.planodecontas.MontadorPlanoDeContas;
import com.fincore.planodecontas.MontadorPlanoLucroReal;
import java.util.List;
import org.junit.jupiter.api.Test;

class FactoryMethodTest {

    @Test
    void importadorOfxCriaOLeitorOfxERejeitaAsLinhasComErro() {
        ImportadorExtrato importador = new ImportadorOfx();

        List<LinhaExtrato> linhas = importador.importar(AmostrasExtrato.de("OFX"));

        assertThat(importador.getLeitor()).isInstanceOf(LeitorOfx.class);
        assertThat(linhas).hasSize(5);
        assertThat(linhas.stream().filter(l -> !l.ehValida()).map(LinhaExtrato::getErro))
                .containsExactly("Campo TRNAMT ausente ou inválido na transação.", "Data 31/02/2026 inexistente.");
    }

    @Test
    void cadaImportadorLeOsMesmosLancamentosNoSeuFormato() {
        for (ImportadorExtrato importador : List.of(new ImportadorOfx(), new ImportadorCnab240(), new ImportadorCnab400())) {
            List<LinhaExtrato> validas = importador.importar(AmostrasExtrato.de(importador.getLeitor().formato()))
                    .stream().filter(LinhaExtrato::ehValida).toList();

            assertThat(validas).extracting(LinhaExtrato::getValor).containsExactly(12450.0, 7350.0, 12760.35);
            assertThat(validas).extracting(LinhaExtrato::getTipo).containsExactly("Crédito", "Débito", "Débito");
        }
    }

    @Test
    void extensaoErradaERecusada() {
        assertThatThrownBy(() -> new ImportadorOfx().importar(new ArquivoExtrato("RETORNO.ret", "")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("aceita apenas arquivos .ofx");
    }

    @Test
    void lucroRealAcrescentaTresContasEmOrdemDeCodigo() {
        List<ContaPlano> base = List.of(
                new ContaPlano("2.1.2.1.01", "Obrigações Tributárias", 2, "ANALÍTICA", 360000.0, "Passivo"),
                new ContaPlano("1.0.0.0.00", "Ativo", 0, "SINTÉTICA", 3450210.55, "Ativo"));
        MontadorPlanoDeContas montador = new MontadorPlanoLucroReal();

        List<ContaPlano> plano = montador.montar(base);

        assertThat(montador.getEnquadramento()).isInstanceOf(EnquadramentoLucroReal.class);
        assertThat(plano).extracting(ContaPlano::getCodigo)
                .containsExactly("1.0.0.0.00", "1.1.3.1.01", "2.1.2.1.01", "2.1.2.1.05", "2.1.2.1.06");
    }
}
