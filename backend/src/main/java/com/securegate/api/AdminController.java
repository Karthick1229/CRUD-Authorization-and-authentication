package com.securegate.api;

import com.securegate.api.ApiDtos.RoleRequest;
import com.securegate.api.ApiDtos.StatsResponse;
import com.securegate.api.ApiDtos.StatusRequest;
import com.securegate.api.ApiDtos.UserResponse;
import com.securegate.user.Role;
import com.securegate.user.UserRepository;
import com.securegate.user.UserService;
import jakarta.validation.Valid;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final UserRepository users;

    public AdminController(UserService userService, UserRepository users) {
        this.userService = userService;
        this.users = users;
    }

    @GetMapping("/users")
    public Page<UserResponse> users(@RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        if (!Set.of("createdAt", "fullName", "email").contains(sort)) {
            throw new IllegalArgumentException("Unsupported sort field.");
        }
        PageRequest request = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 50)), Sort.by(direction, sort));
        return userService.searchUsers(query, active, request).map(UserResponse::from);
    }

    @GetMapping("/users/{id}")
    public UserResponse user(@PathVariable long id) {
        return users.findById(id).map(UserResponse::from).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found."));
    }

    @PatchMapping("/users/{id}/status")
    public UserResponse status(@PathVariable long id, Authentication authentication, @Valid @RequestBody StatusRequest request) {
        return UserResponse.from(userService.updateStatus(id, request, authentication.getName()));
    }

    @PatchMapping("/users/{id}/role")
    public UserResponse role(@PathVariable long id, Authentication authentication, @Valid @RequestBody RoleRequest request) {
        return UserResponse.from(userService.updateRole(id, request, authentication.getName()));
    }

    @GetMapping("/dashboard/stats")
    public StatsResponse stats() {
        return new StatsResponse(users.count(), users.countByActiveTrue(), users.countByRole(Role.ADMIN));
    }
}
