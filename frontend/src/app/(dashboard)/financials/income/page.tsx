"use client";
import { useState, useEffect } from "react";
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
import SelectInput from "@/components/ui/SelectInput";
import { Income, IncomeCategory } from "@/interfaces/income";
import { IncomeService } from "@/services/income";
import { EntitiesService, EntityOption } from "@/services/entities";

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<EntityOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [form, setForm] = useState({
    category_id: 1,
    description: "",
    amount: 0,
    received_date: "",
    due_date: "",
    is_received: true,
  });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category_id: '',
    is_received: '',
    search: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    IncomeService.getIncomes({
      page: currentPage,
      per_page: perPage,
      category_id: filters.category_id || undefined,
      is_received: filters.is_received || undefined,
      search: filters.search || undefined,
    })
      .then((res) => {
        setIncomes(res.data);
        setTotalItems(res.meta.total);
        setTotalPages(res.meta.last_page);
      })
      .catch(() => setError("Failed to load incomes."))
      .finally(() => setLoading(false));
  }, [currentPage, perPage, filters]);

  useEffect(() => {
    EntitiesService.getIncomeCategories().then((res) => {
      setCategories(res);
    });
  }, [editingIncome]);

  const handleOpenModal = (income?: Income) => {
    if (income) {
      setEditingIncome(income);
      setForm({
        category_id: income.category_id,
        description: income.description || "",
        amount: income.amount,
        received_date: income.received_date,
        due_date: income.due_date || "",
        is_received: income.is_received,
      });
    } else {
      setEditingIncome(null);
      setForm({
        category_id: categories[0]?.id || 1,
        description: "",
        amount: 0,
        received_date: "",
        due_date: "",
        is_received: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIncome(null);
    setForm({
      category_id: categories[0]?.id || 1,
      description: "",
      amount: 0,
      received_date: "",
      due_date: "",
      is_received: true,
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setErrors({});
    try {
      if (editingIncome) {
        const updated = await IncomeService.updateIncome(editingIncome.id, form);
        setIncomes((prev) => prev.map((inc) => (inc.id === updated.id ? updated : inc)));
      } else {
        const created = await IncomeService.createIncome(form);
        setIncomes((prev) => [created, ...prev]);
      }
      handleCloseModal();
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.errors) {
        setErrors(e.response.data.errors);
      } else {
        setError("Failed to save income.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this income?")) return;
    setLoading(true);
    setError(null);
    try {
      await IncomeService.deleteIncome(id);
      setIncomes((prev) => prev.filter((inc) => inc.id !== id));
    } catch (e) {
      setError("Failed to delete income.");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const columns = [
    { key: "category", label: "Category", render: (_: any, row: Income) => row.category?.name || "-" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount" },
    { key: "received_date", label: "Received Date" },
    { key: "due_date", label: "Due Date" },
    {
      key: "is_received",
      label: "Received",
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${value ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
          {value ? "Received" : "Pending"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Income) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            <i className="fas fa-edit mr-1"></i>Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
            <i className="fas fa-trash mr-1"></i>Delete
          </Button>
        </div>
      ),
    },
  ];

  const renderIncomeCard = (income: Income) => (
    <div className="rounded-xl shadow-lg p-6 bg-white dark:bg-gray-800 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{income.category?.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${income.is_received ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
          {income.is_received ? "Received" : "Pending"}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{income.description || 'No description'}</p>
      <div className="flex items-center justify-between text-sm mb-2">
        <span>Amount: <b>${income.amount}</b></span>
        <span>Received: {income.received_date}</span>
      </div>
      {income.due_date && <div className="text-xs text-gray-500">Due: {income.due_date}</div>}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => handleOpenModal(income)}>
          <i className="fas fa-edit mr-1"></i>Edit
        </Button>
      </div>
    </div>
  );

  // Custom filter UI in a grid above the table (no card)
  const renderFilters = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SelectInput
        value={filters.category_id}
        onChange={(val) => handleFiltersChange({ ...filters, category_id: val })}
        options={[
          { value: '', label: 'All Categories' },
          ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
        ]}
        placeholder="Filter by category"
        label="Category"
      />
      <SelectInput
        value={filters.is_received}
        onChange={(val) => handleFiltersChange({ ...filters, is_received: val })}
        options={[
          { value: '', label: 'All' },
          { value: 'true', label: 'Received' },
          { value: 'false', label: 'Pending' },
        ]}
        placeholder="Filter by received status"
        label="Received Status"
      />
      <FormField label="Search">
        <TextInput
          value={filters.search}
          onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
          placeholder="Description or amount..."
        />
      </FormField>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Income Management"
          description="Track and manage all income sources."
        />
        <div className="flex justify-between items-center mb-4">
          <ViewToggle
            value={viewMode}
            onChange={(val) => setViewMode(val as 'table' | 'grid')}
            options={[
              { value: 'table', label: 'Table', icon: 'fas fa-table' },
              { value: 'grid', label: 'Grid', icon: 'fas fa-th' },
            ]}
            count={totalItems}
            countLabel="incomes"
          />
          <Button onClick={() => handleOpenModal()}>
            <i className="fas fa-plus mr-2"></i>New Income
          </Button>
        </div>
        {viewMode === 'table' ? (
          <>
            {renderFilters}
            <DataTable
              columns={columns}
              data={incomes}
              loading={loading}
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                perPage,
                onPageChange: setCurrentPage,
                onPerPageChange: (val) => {
                  setPerPage(val);
                  setCurrentPage(1);
                },
              }}
              emptyMessage="No incomes found."
            />
          </>
        ) : (
          <DataGrid
            data={incomes}
            renderCard={renderIncomeCard}
            columns={3}
          />
        )}
        {showModal && (
          <Modal isOpen={showModal} onClose={handleCloseModal} title={editingIncome ? "Edit Income" : "New Income"} size="md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              <FormField label="Category" required error={errors.category_id}>
                <SelectInput
                  value={String(form.category_id)}
                  onChange={(val) => handleFormChange("category_id", Number(val))}
                  options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
                  placeholder="Select category"
                  required
                  error={errors.category_id}
                />
              </FormField>
              <FormField label="Description" error={errors.description}>
                <TextInput
                  value={form.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  error={errors.description}
                />
              </FormField>
              <FormField label="Amount" required error={errors.amount}>
                <TextInput
                  type="number"
                  value={form.amount}
                  onChange={(e) => handleFormChange("amount", Number(e.target.value))}
                  required
                  error={errors.amount}
                />
              </FormField>
              <FormField label="Received Date" required error={errors.received_date}>
                <TextInput
                  type="date"
                  value={form.received_date}
                  onChange={(e) => handleFormChange("received_date", e.target.value)}
                  required
                  error={errors.received_date}
                />
              </FormField>
              <FormField label="Due Date" error={errors.due_date}>
                <TextInput
                  type="date"
                  value={form.due_date}
                  onChange={(e) => handleFormChange("due_date", e.target.value)}
                  error={errors.due_date}
                />
              </FormField>
              <FormField label="Received">
                <input
                  type="checkbox"
                  checked={form.is_received}
                  onChange={(e) => handleFormChange("is_received", e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </FormField>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleCloseModal} type="button">
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIncome ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}