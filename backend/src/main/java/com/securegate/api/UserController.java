package com.securegate.api;

import com.securegate.api.ApiDtos.ChangePasswordRequest;
import com.securegate.api.ApiDtos.ProfileUpdateRequest;
import com.securegate.api.ApiDtos.UserResponse;
import com.securegate.user.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public UserResponse profile(Authentication authentication) {
        return UserResponse.from(userService.findByEmail(authentication.getName()));
    }

    @PutMapping
    public UserResponse updateProfile(Authentication authentication, @Valid @RequestBody ProfileUpdateRequest request) {
        return UserResponse.from(userService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/password")
    public void changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(authentication.getName(), request);
    }
}
