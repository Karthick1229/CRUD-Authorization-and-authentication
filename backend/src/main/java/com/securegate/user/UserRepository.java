package com.securegate.user;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AccountUser, Long> {

    Optional<AccountUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Page<AccountUser> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(String email, String fullName, Pageable pageable);

    @Query("SELECT user FROM AccountUser user WHERE (:active IS NULL OR user.active = :active) "
            + "AND (:term = '' OR LOWER(user.email) LIKE LOWER(CONCAT('%', :term, '%')) "
            + "OR LOWER(user.fullName) LIKE LOWER(CONCAT('%', :term, '%')))")
    Page<AccountUser> searchForAdmin(@Param("term") String term, @Param("active") Boolean active, Pageable pageable);

    long countByActiveTrue();

    long countByRole(Role role);

    long countByRoleAndActiveTrue(Role role);
}
