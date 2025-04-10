"use client";
import React from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { notFound } from "next/navigation";

const ReportPage = () => {
  notFound();
  const { user } = useAuth();

  if (user?.role !== "Pemilik" && user?.role !== "Pengelola") {
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied: Only Pemilik or Pengelola can view reports</div>;
  }

  // Dummy data
  const monthlySales = [
    { month: 'January', amount: 12500000 },
    { month: 'February', amount: 15600000 },
    { month: 'March', amount: 14300000 },
    { month: 'April', amount: 16800000 },
  ];

  const topProducts = [
    { name: 'Product A', sales: 285, revenue: 14250000 },
    { name: 'Product B', sales: 210, revenue: 10500000 },
    { name: 'Product C', sales: 185, revenue: 9250000 },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Sales Report</h1>
      
      {/* Monthly Sales */}
      <div className="mb-6">
        <h2 className="text-lg mb-2">Monthly Sales</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Month</th>
              <th className="border p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {monthlySales.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.month}</td>
                <td className="border p-2">Rp {item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Products */}
      <div>
        <h2 className="text-lg mb-2">Top Products</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Product</th>
              <th className="border p-2">Units Sold</th>
              <th className="border p-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={index}>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.sales}</td>
                <td className="border p-2">Rp {product.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportPage;