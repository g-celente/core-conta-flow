package com.fincore.repository;

import com.fincore.domain.Alcada;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlcadaRepository extends JpaRepository<Alcada, String> {
    List<Alcada> findAllByOrderByLimiteAsc();
}
