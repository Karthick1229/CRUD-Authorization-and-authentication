package com.securegate.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.securegate.api.ApiDtos.RegisterRequest;
import com.securegate.api.ApiDtos.StatusRequest;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository users;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(users, new BCryptPasswordEncoder(4));
    }

    @Test
    void registrationNormalizesEmailHashesPasswordAndAssignsUserRole() {
        when(users.existsByEmailIgnoreCase("jordan@example.com")).thenReturn(false);
        when(users.save(any(AccountUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AccountUser created = userService.register(new RegisterRequest("Jordan Lee", " Jordan@Example.com ", "long-demo-password"));

        assertEquals("jordan@example.com", created.getEmail());
        assertEquals(Role.USER, created.getRole());
        assertNotEquals("long-demo-password", created.getPassword());
        verify(users).save(created);
    }

    @Test
    void duplicateEmailIsRejectedBeforeSaving() {
        when(users.existsByEmailIgnoreCase("jordan@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> userService.register(new RegisterRequest("Jordan Lee", "Jordan@example.com", "long-demo-password")));
    }

    @Test
    void accountLookupUsesCaseInsensitiveRepositoryMethod() {
        AccountUser user = new AccountUser("Jordan Lee", "jordan@example.com", "encoded", Role.USER);
        when(users.findByEmailIgnoreCase("JORDAN@example.com")).thenReturn(Optional.of(user));

        assertEquals(user, userService.findByEmail("JORDAN@example.com"));
    }

    @Test
    void lastActiveAdministratorCannotBeDeactivated() {
        AccountUser administrator = new AccountUser("Jordan Lee", "jordan@example.com", "encoded", Role.ADMIN);
        when(users.findById(7L)).thenReturn(Optional.of(administrator));
        when(users.countByRoleAndActiveTrue(Role.ADMIN)).thenReturn(1L);

        assertThrows(IllegalArgumentException.class,
                () -> userService.updateStatus(7L, new StatusRequest(false), "another-admin@example.com"));
        assertTrue(administrator.isActive());
    }
}
