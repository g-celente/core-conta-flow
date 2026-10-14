package com.fincore.repository;

import com.fincore.domain.Parceiro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParceiroRepository extends JpaRepository<Parceiro, String> {
}
