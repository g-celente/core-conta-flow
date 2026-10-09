package com.fincore.service;

import com.fincore.domain.Alcada;
import com.fincore.domain.PedidoAprovacao;
import com.fincore.pattern.aprovacao.AprovadorDeTitulo;
import com.fincore.pattern.aprovacao.AprovadorPorAlcada;
import com.fincore.pattern.aprovacao.ComiteFinanceiro;
import com.fincore.pattern.aprovacao.DecisaoAprovacao;
import com.fincore.repository.AlcadaRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/** Chain of Responsibility — cliente: monta a corrente e entrega cada pedido ao primeiro elo. */
@Service
public class AprovacaoService {
    private final AlcadaRepository alcadas;

    public AprovacaoService(AlcadaRepository alcadas) {
        this.alcadas = alcadas;
    }

    public List<DecisaoAprovacao> responsaveis(List<PedidoAprovacao> pedidos) {
        AprovadorDeTitulo corrente = montarCorrente();
        return pedidos.stream().map(corrente::analisar).toList();
    }

    /** Um elo por alçada do banco, em ordem de limite, e o comitê no fim (sem alçadas, só o comitê). */
    private AprovadorDeTitulo montarCorrente() {
        List<AprovadorDeTitulo> elos = new ArrayList<>();
        for (Alcada alcada : alcadas.findAllByOrderByLimiteAsc()) {
            elos.add(new AprovadorPorAlcada(alcada));
        }
        elos.add(new ComiteFinanceiro(List.of("Carlos Eduardo Menezes", "Paula Nunes")));
        for (int i = 0; i < elos.size() - 1; i++) {
            elos.get(i).encadear(elos.get(i + 1));
        }
        return elos.getFirst();
    }
}
