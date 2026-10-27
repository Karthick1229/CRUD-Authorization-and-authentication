package com.securegate.user;

import com.securegate.api.ApiDtos.ChangePasswordRequest;
import com.securegate.api.ApiDtos.ProfileUpdateRequest;
import com.securegate.api.ApiDtos.RegisterRequest;
import com.securegate.api.ApiDtos.RoleRequest;
import com.securegate.api.ApiDtos.StatusRequest;
import jakarta.persistence.EntityNotFoundException;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AccountUser register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with that email already exists.");
        }
        return users.save(new AccountUser(request.fullName().trim(), email,
                passwordEncoder.encode(request.password()), Role.USER));
    }

    @Transactional(readOnly = true)
    public AccountUser findByEmail(String email) {
        return users.findByEmailIgnoreCase(email).orElseThrow(() -> new EntityNotFoundException("Account not found."));
    }

    @Transactional
    public AccountUser updateProfile(String email, ProfileUpdateRequest request) {
        AccountUser user = findByEmail(email);
        user.setFullName(request.fullName().trim());
        return user;
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        AccountUser user = findByEmail(email);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect.");
        }
        user.changePassword(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional(readOnly = true)
    public Page<AccountUser> searchUsers(String query, Boolean active, Pageable pageable) {
        String term = query == null ? "" : query.trim();
        return users.searchForAdmin(term, active, pageable);
    }

    @Transactional
    public AccountUser updateStatus(long id, StatusRequest request, String actorEmail) {
        AccountUser user = findById(id);
        if (!request.active() && user.getEmail().equalsIgnoreCase(actorEmail)) {
            throw new IllegalArgumentException("You cannot deactivate your own account.");
        }
        ensureAnotherAdminRemains(user, request.active(), user.getRole());
        user.setActive(request.active());
        return user;
    }

    @Transactional
    public AccountUser updateRole(long id, RoleRequest request, String actorEmail) {
        if (request.role() == null) {
            throw new IllegalArgumentException("Role is required.");
        }
        AccountUser user = findById(id);
        if (user.getEmail().equalsIgnoreCase(actorEmail) && request.role() != Role.ADMIN) {
            throw new IllegalArgumentException("You cannot remove your own administrator role.");
        }
        ensureAnotherAdminRemains(user, user.isActive(), request.role());
        user.setRole(request.role());
        return user;
    }

    private void ensureAnotherAdminRemains(AccountUser user, boolean active, Role newRole) {
        boolean isLosingActiveAdmin = user.isActive() && user.getRole() == Role.ADMIN
                && (!active || newRole != Role.ADMIN);
        if (isLosingActiveAdmin && users.countByRoleAndActiveTrue(Role.ADMIN) <= 1) {
            throw new IllegalArgumentException("The last active administrator cannot be removed.");
        }
    }

    private AccountUser findById(long id) {
        return users.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found."));
    }
}
