package com.securegate.config;

import com.securegate.user.AccountUser;
import com.securegate.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class ActiveAccountFilter extends OncePerRequestFilter {

    private final UserRepository users;

    public ActiveAccountFilter(UserRepository users) {
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof AccountUser account) {
            AccountUser currentAccount = users.findByEmailIgnoreCase(account.getUsername()).orElse(null);
            if (currentAccount == null || !currentAccount.isActive()) {
                SecurityContextHolder.clearContext();
                var session = request.getSession(false);
                if (session != null) {
                    session.invalidate();
                }
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            SecurityContextHolder.getContext().setAuthentication(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            currentAccount, null, currentAccount.getAuthorities()));
        }
        chain.doFilter(request, response);
    }
}
