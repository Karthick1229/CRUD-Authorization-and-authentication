import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./services/api", () => ({
    default: { get: vi.fn().mockRejectedValue(new Error("API is not running")) },
    refreshCsrf: vi.fn().mockResolvedValue("csrf-token"),
}));

describe("public app routes", () => {
    it("shows the product landing page when the visitor is signed out", async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>,
        );

        expect(
            await screen.findByRole("heading", {
                name: /one place to manage who gets in/i,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /create account/i }),
        ).toHaveAttribute("href", "/register");
    });
});
