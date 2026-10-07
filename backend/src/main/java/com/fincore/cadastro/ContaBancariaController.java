package com.fincore.cadastro;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contas-bancarias")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ContaBancariaController extends CrudController<ContaBancaria> {
    public ContaBancariaController(ContaBancariaRepository repositorio) {
        super(repositorio);
    }
}
