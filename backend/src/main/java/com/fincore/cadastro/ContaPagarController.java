package com.fincore.cadastro;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contas-pagar")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ContaPagarController extends CrudController<ContaPagar> {
    public ContaPagarController(ContaPagarRepository repositorio) {
        super(repositorio);
    }
}
