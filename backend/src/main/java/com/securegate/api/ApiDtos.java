package com.securegate.api;

import com.securegate.user.AccountUser;
import com.securegate.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class ApiDtos {

    private ApiDtos() {
    }

    public record RegisterRequest(@NotBlank
            @Size(max = 100) String fullName,
            @NotBlank
            @Email
            @Size(max = 190) String email,
            @NotBlank
            @Size(min = 12, max = 72) String password) {

    }

    public record LoginRequest(@NotBlank
            @Email String email, @NotBlank String password) {

    }

    public record ProfileUpdateRequest(@NotBlank
            @Size(max = 100) String fullName) {

    }

    public record ChangePasswordRequest(@NotBlank String currentPassword,
            @NotBlank
            @Size(min = 12, max = 72) String newPassword) {

    }

    public record StatusRequest(boolean active) {

    }

    public record RoleRequest(Role role) {

    }

    public record UserResponse(Long id, String fullName, String email, String role, boolean active, Instant createdAt) {

        public static UserResponse from(AccountUser user) {
            return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), user.isActive(), user.getCreatedAt());
        }
    }

    public record StatsResponse(long totalUsers, long activeUsers, long administrators) {

    }

    public record MessageResponse(String message) {

    }

    public record CsrfResponse(String token) {

    }
}
