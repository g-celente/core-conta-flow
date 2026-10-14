package com.fincore.controller;

import com.fincore.domain.ContaReceber;
import com.fincore.repository.ContaReceberRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contas-receber")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ContaReceberController extends CrudController<ContaReceber> {
    public ContaReceberController(ContaReceberRepository repositorio) {
        super(repositorio);
    }
}
