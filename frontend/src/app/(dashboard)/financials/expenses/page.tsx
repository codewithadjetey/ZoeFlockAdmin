"use client";
import { useState } from "react";
import {
  PageHeader,
  DataTable,
  Button,
  FormField,
  TextInput
} from "@/components/ui";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataGrid from "@/components/ui/DataGrid";
import ViewToggle from "@/components/ui/ViewToggle";
import Modal from "@/components/shared/Modal";

interface Expense {
  id: number;
  category_id: number;
  category_name: string;
  description?: string;
  amount: number;
  paid_date: string;
  due_date?: string;
  is_paid: boolean;
}

const mockCategories = [
  { id: 1, name: "Utilities" },
  { id: 2, name: "Salaries" },
  { id: 3, name: "Maintenance" },
];

const mockExpenses: Expense[] = [
  { id: 1, category_id: 1, category_name: "Utilities", description: "Electricity bill", amount: 120.5, paid_date: "2024-07-01", is_paid: true },
  { id: 2, category_id: 2, category_name: "Salaries", description: "July payroll", amount: 3000, paid_date: "2024-07-05", is_paid: true },
  { id: 3, category_id: 3, category_name: "Maintenance", description: "AC repair", amount: 250, paid_date: "2024-07-10", is_paid: false, due_date: "2024-07-15" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [categories] = useState(mockCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState({
    category_id: categories[0]?.id || 1,
    description: "",
    amount: 0,
    paid_date: "",
    due_date: "",
    is_paid: false,
  });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setForm({
        category_id: expense.category_id,
        description: expense.description || "",
        amount: expense.amount,
        paid_date: expense.paid_date,
        due_date: expense.due_date || "",
        is_paid: expense.is_paid,
      });
    } else {
      setEditingExpense(null);
      setForm({
        category_id: categories[0]?.id || 1,
        description: "",
        amount: 0,
        paid_date: "",
        due_date: "",
        is_paid: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setForm({
      category_id: categories[0]?.id || 1,
      description: "",
      amount: 0,
      paid_date: "",
      due_date: "",
      is_paid: false,
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === editingExpense.id ? { ...editingExpense, ...form, category_name: categories.find(c => c.id === form.category_id)?.name || "" } : exp
        )
      );
    } else {
      setExpenses((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          ...form,
          category_name: categories.find(c => c.id === form.category_id)?.name || "",
        },
      ]);
    }
    handleCloseModal();
  };

  const columns = [
    { key: "category_name", label: "Category" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount" },
    { key: "paid_date", label: "Paid Date" },
    { key: "due_date", label: "Due Date" },
    {
      key: "is_paid",
      label: "Paid",
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${value ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
          {value ? "Paid" : "Unpaid"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Expense) => (
        <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
          <i className="fas fa-edit mr-1"></i>Edit
        </Button>
      ),
    },
  ];

  const renderExpenseCard = (expense: Expense) => (
    <div className="rounded-xl shadow-lg p-6 bg-white dark:bg-gray-800 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{expense.category_name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${expense.is_paid ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
          {expense.is_paid ? "Paid" : "Unpaid"}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{expense.description || 'No description'}</p>
      <div className="flex items-center justify-between text-sm mb-2">
        <span>Amount: <b>${expense.amount}</b></span>
        <span>Paid: {expense.paid_date}</span>
      </div>
      {expense.due_date && <div className="text-xs text-gray-500">Due: {expense.due_date}</div>}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => handleOpenModal(expense)}>
          <i className="fas fa-edit mr-1"></i>Edit
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Expenses Management"
          description="Track and manage all expenses."
        />
        <div className="flex justify-between items-center mb-4">
          <ViewToggle
            value={viewMode}
            onChange={(val) => setViewMode(val as 'table' | 'grid')}
            options={[
              { value: 'table', label: 'Table', icon: 'fas fa-table' },
              { value: 'grid', label: 'Grid', icon: 'fas fa-th' },
            ]}
            count={expenses.length}
            countLabel="expenses"
          />
          <Button onClick={() => handleOpenModal()}>
            <i className="fas fa-plus mr-2"></i>New Expense
          </Button>
        </div>
        {viewMode === 'table' ? (
          <DataTable
            columns={columns}
            data={expenses}
            emptyMessage="No expenses found."
          />
        ) : (
          <DataGrid
            data={expenses}
            renderCard={renderExpenseCard}
            columns={3}
          />
        )}
        {showModal && (
          <Modal isOpen={showModal} onClose={handleCloseModal} title={editingExpense ? "Edit Expense" : "New Expense"} size="md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              <FormField label="Category" required>
                <select
                  value={form.category_id}
                  onChange={(e) => handleFormChange("category_id", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Description">
                <TextInput
                  value={form.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                />
              </FormField>
              <FormField label="Amount" required>
                <TextInput
                  type="number"
                  value={form.amount}
                  onChange={(e) => handleFormChange("amount", Number(e.target.value))}
                  required
                />
              </FormField>
              <FormField label="Paid Date" required>
                <TextInput
                  type="date"
                  value={form.paid_date}
                  onChange={(e) => handleFormChange("paid_date", e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Due Date">
                <TextInput
                  type="date"
                  value={form.due_date}
                  onChange={(e) => handleFormChange("due_date", e.target.value)}
                />
              </FormField>
              <FormField label="Paid">
                <input
                  type="checkbox"
                  checked={form.is_paid}
                  onChange={(e) => handleFormChange("is_paid", e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm">Paid</span>
              </FormField>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleCloseModal} type="button">
                  Cancel
                </Button>
                <Button type="submit">
                  {editingExpense ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}