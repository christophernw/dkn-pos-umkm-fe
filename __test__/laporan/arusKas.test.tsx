import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { within } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import ReportPage from "@/src/app/(withNavbar)/report/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/src/utils/pdfGenerator', () => ({
    generateDebtReportPDF: jest.fn(() => new Blob(["PDF content"], { type: "application/pdf" })),
    PDFReportData: {}
}));

jest.mock('@/src/utils/excelGenerator', () => ({
    generateDebtReportExcel: jest.fn(() => new Blob(["Excel content"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })),
    ExcelReportData: {}
}));

jest.mock("@/contexts/AuthContext");
jest.mock("@/contexts/ModalContext");

global.fetch = jest.fn().mockImplementation((url) => {
    if (url.toString().includes('first-transaction-date')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ first_date: "2025-05-01" })
      });
    }
  
    if (url.toString().includes('aruskas-report')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 1,
          month: 5,
          year: 2025,
          total_inflow: "150000",
          total_outflow: "50000",
          balance: "100000",
          transactions: [
            {
              id: 1,
              jenis: "inflow",
              kategori: "Penjualan",
              nominal: "150000",
              tanggal_transaksi: "2025-05-01T00:00:00+07:00",
              transaksi_id: 101
            }
          ]
        })
      });
    }
  
    return Promise.resolve({
      ok: true,
      json: async () => ({})
    });
  });

const mockTransactions = [
    {
      id: 1,
      jenis: "inflow",
      kategori: "Penjualan",
      nominal: "150000",
      tanggal_transaksi: "2025-05-01T00:00:00+07:00",
      transaksi_id: 101
    },
    {
      id: 2,
      jenis: "outflow",
      kategori: "Pembelian",
      nominal: "50000",
      tanggal_transaksi: "2025-05-02T00:00:00+07:00",
      transaksi_id: 102
    }
  ];
  
  const mockArusKasResponse = {
    id: 1,
    month: 5,
    year: 2025,
    total_inflow: "150000",
    total_outflow: "50000",
    balance: "100000",
    transactions: mockTransactions
  };
  
  beforeEach(() => {
    jest.resetAllMocks(); // 🧼 penting: reset mock fetch sebelumnya
  
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: "Pemilik" },
      accessToken: "mocked_token"
    });
  
    (useModal as jest.Mock).mockReturnValue({
      showModal: jest.fn()
    });
  });
  

test("menampilkan transaksi arus kas setelah fetch", async () => {
(fetch as jest.Mock).mockImplementation((url) => {
    if (url.toString().includes("first-transaction-date")) {
    return Promise.resolve({
        ok: true,
        json: async () => ({ first_date: "2025-05-01" })
    });
    }

    if (url.toString().includes("aruskas-report")) {
    return Promise.resolve({
        ok: true,
        json: async () => mockArusKasResponse
    });
    }

    return Promise.resolve({ ok: true, json: async () => ({}) });
});

render(<ReportPage />);
const dropdown = screen.getByText(/Laporan Utang Piutang/i);
userEvent.click(dropdown);

const arusKasOption = await screen.findByText("Laporan Arus Kas");
userEvent.click(arusKasOption);

await waitFor(() => {
    const transactionItem = screen.getByText(/Transaksi #101/i).closest('.bg-white') as HTMLElement;
    expect(transactionItem).toBeInTheDocument();
    within(transactionItem).getByText(/Kas Masuk/i);
    within(transactionItem).getByText(/150\.000/);
});
});
  

test("menampilkan pesan saat tidak ada transaksi arus kas", async () => {
    (fetch as jest.Mock).mockImplementation((url) => {
    if (url.toString().includes("first-transaction-date")) {
        return Promise.resolve({
        ok: true,
        json: async () => ({ first_date: "2025-05-01" })
        });
    }

    if (url.toString().includes("aruskas-report")) {
        return Promise.resolve({
        ok: true,
        json: async () => ({
            id: 1,
            month: 5,
            year: 2025,
            total_inflow: "0",
            total_outflow: "0",
            balance: "0",
            transactions: []
        })
        });
    }

    return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    render(<ReportPage />);
    const dropdown = screen.getByText(/Laporan Utang Piutang/i);
    userEvent.click(dropdown);

    const arusKasOption = await screen.findByText("Laporan Arus Kas");
    userEvent.click(arusKasOption);

    const emptyMessage = await screen.findByText(/Tidak ada transaksi untuk periode ini/i);
    expect(emptyMessage).toBeInTheDocument();
});

test("menampilkan fallback saat fetch laporan arus kas gagal", async () => {
    (fetch as jest.Mock).mockImplementation((url) => {
        if (url.toString().includes("first-transaction-date")) {
        return Promise.resolve({
            ok: true,
            json: async () => ({ first_date: "2025-05-01" })
        });
        }

        if (url.toString().includes("aruskas-report")) {
        return Promise.reject(new Error("Network Error"));
        }

        return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    render(<ReportPage />);

    const dropdown = screen.getByText(/Laporan Utang Piutang/i);
    userEvent.click(dropdown);

    const arusKasOption = await screen.findByText("Laporan Arus Kas");
    userEvent.click(arusKasOption);

    const fallbackMessage = await screen.findByText(/Tidak ada transaksi untuk periode ini./i);
    expect(fallbackMessage).toBeInTheDocument();
});
  

