package com.example.demo.repository;

import com.example.demo.model.SimulationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query; // חובה להוסיף
import org.springframework.data.repository.query.Param; // חובה להוסיף
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface SimulationResultRepository extends JpaRepository<SimulationResult, Long> {
    List<SimulationResult> findByTraineeId(String traineeId);

    @Modifying
    @Transactional
    @Query("DELETE FROM SimulationResult s WHERE s.agent.id = :agentId")
    void deleteByAgentId(@Param("agentId") Long agentId);
}