package com.fincore.cadastro;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parceiros")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ParceiroController extends CrudController<Parceiro> {
    public ParceiroController(ParceiroRepository repositorio) {
        super(repositorio);
    }
}
