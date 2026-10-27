# SecureGate Coding Notes

- Prefer clear, human-writable Java and JavaScript with focused methods and explicit names.
- Keep authentication in Spring Security server-side sessions; never store session IDs or tokens in browser localStorage.
- Public registration always assigns USER. Enforce administrator access in Spring Security, not only in React.
- Use API DTOs and never return password hashes or secret configuration.
- Validate frontend changes with `npm test` and `npm run build`; validate backend changes with `mvn test`.
- Explain non-obvious security decisions in the README using simple language.