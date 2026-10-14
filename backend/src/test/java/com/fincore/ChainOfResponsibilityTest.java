package com.fincore;

import com.fincore.domain.Alcada;
import com.fincore.domain.ConfiguracaoTenant;
import com.fincore.domain.Notificacao;
import com.fincore.domain.PedidoAprovacao;
import com.fincore.pattern.aprovacao.AprovadorDeTitulo;
import com.fincore.pattern.aprovacao.AprovadorPorAlcada;
import com.fincore.pattern.aprovacao.ComiteFinanceiro;
import com.fincore.pattern.aprovacao.DecisaoAprovacao;
import com.fincore.pattern.notificacao.CanalEmail;
import com.fincore.pattern.notificacao.CanalNotificacao;
import com.fincore.pattern.notificacao.CanalPush;
import com.fincore.pattern.notificacao.EnvioNotificacao;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class ChainOfResponsibilityTest {

    /** Operador (10 mil) → Analista (25 mil) → comitê. */
    private AprovadorDeTitulo escada() {
        AprovadorDeTitulo inicio = new AprovadorPorAlcada(new Alcada("Operador financeiro", "Marina Duarte", 10000));
        inicio.encadear(new AprovadorPorAlcada(new Alcada("Analista financeiro", "Renata Oliveira", 25000)))
                .encadear(new ComiteFinanceiro(List.of("Carlos Eduardo Menezes", "Paula Nunes")));
        return inicio;
    }

    private CanalNotificacao canais(List<String> features) {
        CanalNotificacao push = new CanalPush(new ConfiguracaoTenant(features));
        push.encadear(new CanalEmail());
        return push;
    }

    @Test
    void valorNoLimiteFicaComOProprioOperador() {
        DecisaoAprovacao decisao = escada().analisar(new PedidoAprovacao("FAT-1", 10000, "Marina Duarte"));

        assertThat(decisao.nivel()).isEqualTo("Operador financeiro");
        assertThat(decisao.exigeFila()).isFalse();
    }

    @Test
    void valorAcimaDoOperadorSobeParaOAnalista() {
        DecisaoAprovacao decisao = escada().analisar(new PedidoAprovacao("NF-20491", 14502.33, "Marina Duarte"));

        assertThat(decisao.nivel()).isEqualTo("Analista financeiro");
        assertThat(decisao.responsavel()).isEqualTo("Renata Oliveira");
        assertThat(decisao.exigeFila()).isTrue();
    }

    @Test
    void valorAcimaDeTodasAsAlcadasVaiParaOComite() {
        DecisaoAprovacao decisao = escada().analisar(new PedidoAprovacao("NF-6001", 600000, "Marina Duarte"));

        assertThat(decisao.nivel()).isEqualTo("Comitê financeiro");
        assertThat(decisao.responsavel()).isEqualTo("Carlos Eduardo Menezes + Paula Nunes");
    }

    @Test
    void pushQuandoOTenantContrataSenaoEmail() {
        Notificacao aviso = new Notificacao("Roberto Tanaka", "Título NF-1 aguarda a sua aprovação.", "aprovacao");

        EnvioNotificacao push = canais(List.of("notificacoes_push")).enviar(aviso);
        EnvioNotificacao email = canais(List.of()).enviar(aviso);

        assertThat(push.canal()).isEqualTo("Push");
        assertThat(email.canal()).isEqualTo("E-mail");
        assertThat(email.mensagem()).isEqualTo("[FinCore · aprovacao] Título NF-1 aguarda a sua aprovação.");
    }

    @Test
    void pushCortaMensagemLonga() {
        Notificacao aviso = new Notificacao("Roberto Tanaka", "x".repeat(200), "aprovacao");

        String mensagem = canais(List.of("notificacoes_push")).enviar(aviso).mensagem();

        assertThat(mensagem).hasSize(120).endsWith("…");
    }
}
