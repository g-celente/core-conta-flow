package com.fincore.cadastro;

import com.fincore.dominio.Alcada;
import com.fincore.dominio.AlcadaRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alcadas")
@CrossOrigin(originPatterns = "http://localhost:*")
public class AlcadaController extends CrudController<Alcada> {
    public AlcadaController(AlcadaRepository repositorio) {
        super(repositorio);
    }
}
