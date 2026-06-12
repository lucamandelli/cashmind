import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import * as accountsApi from "@/features/accounts/services/accountsApi";
import { AccountForm } from "./AccountForm";

vi.mock("@/features/accounts/services/accountsApi");
vi.mock("@/hooks/useMediaQuery", () => ({ useIsDesktop: () => true }));

const createMock = vi.mocked(accountsApi.createAccount);

function renderForm(onSuccess = vi.fn(), onOpenChange = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(AccountForm, {
        open: true,
        onOpenChange,
        account: undefined,
        onSuccess,
      }),
    ),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AccountForm — create integration", () => {
  it("submits the correct initialBalance in cents", async () => {
    createMock.mockResolvedValue({
      id: "1",
      name: "Savings",
      initialBalance: 99900,
      currency: "BRL",
      archivedAt: null,
      createdAt: "",
      updatedAt: "",
      userId: "u1",
    } as never);

    const user = userEvent.setup();
    renderForm();

    await user.clear(screen.getByLabelText(/account name/i));
    await user.type(screen.getByLabelText(/account name/i), "Savings");

    const balanceInput = screen.getByLabelText(/initial balance/i);
    await user.clear(balanceInput);
    await user.type(balanceInput, "999");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Savings", initialBalance: 99900 }),
      ),
    );
  });
});
