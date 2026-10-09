package com.fincore.controller;

import com.fincore.domain.ContaPlano;
import com.fincore.pattern.planodecontas.EnquadramentoTributario;
import com.fincore.service.PlanoDeContasService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Plano de contas por regime; o Factory Method é usado no PlanoDeContasService. */
@RestController
@RequestMapping("/api/plano-de-contas")
@CrossOrigin(originPatterns = "http://localhost:*")
public class PlanoDeContasController {
    private final PlanoDeContasService planoDeContas;

    public PlanoDeContasController(PlanoDeContasService planoDeContas) {
        this.planoDeContas = planoDeContas;
    }

    public record Plano(String regime, String descricaoApuracao, List<ContaPlano> contas,
            List<String> codigosDoRegime) {}

    @GetMapping
    public Plano plano(@RequestParam String regime) {
        EnquadramentoTributario enquadramento = planoDeContas.enquadramento(regime);
        return new Plano(enquadramento.regime(), enquadramento.descricaoApuracao(),
                planoDeContas.plano(regime),
                enquadramento.contasTributarias().stream().map(ContaPlano::getCodigo).toList());
    }
}
