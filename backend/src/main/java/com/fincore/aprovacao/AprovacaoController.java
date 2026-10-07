package com.fincore.aprovacao;

import com.fincore.dominio.Alcada;
import com.fincore.dominio.AlcadaRepository;
import com.fincore.dominio.PedidoAprovacao;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Chain of Responsibility — cliente: monta a corrente e entrega cada pedido ao primeiro elo. */
@RestController
@RequestMapping("/api/aprovacoes")
@CrossOrigin(originPatterns = "http://localhost:*")
public class AprovacaoController {
    private final AlcadaRepository alcadas;

    public AprovacaoController(AlcadaRepository alcadas) {
        this.alcadas = alcadas;
    }

    public record PedidoDados(String documento, double valor, String solicitante) {}

    @PostMapping("/responsaveis")
    public List<DecisaoAprovacao> responsaveis(@RequestBody List<PedidoDados> pedidos) {
        AprovadorDeTitulo corrente = montarCorrente();
        return pedidos.stream()
                .map(p -> corrente.analisar(new PedidoAprovacao(p.documento(), p.valor(), p.solicitante())))
                .toList();
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
