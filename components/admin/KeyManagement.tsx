import React, { useState, useEffect } from "react";
import { useAdminStore } from "../../stores/adminStore";
import { type Key } from "../../types";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { ICONS } from "../../constants";

const KeyManagement: React.FC = () => {
  const {
    keys,
    fetchDashboardData,
    isLoading,
    updateKey,
    deleteKey,
  } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<Key | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const openCreateModal = () => {
    setEditingKey(null);
    setIsModalOpen(true);
  };

  const openEditModal = (key: Key) => {
    setEditingKey(key);
    setIsModalOpen(true);
  };

  const handleToggleSuspend = async (key: Key) => {
    const newStatus = key.status === "active" ? "suspended" : "active";
    await updateKey(key.id, { status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this key? This action cannot be undone."
      )
    ) {
      await deleteKey(id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Key Management</h1>
        <Button onClick={openCreateModal} leftIcon={ICONS.add}>
          Create Key
        </Button>
      </div>

      {isLoading && <p>Loading keys...</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Key Value
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Note
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Expires At
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {keys.map((key) => (
              <tr key={key.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-slate-700 w-32 truncate">
                    {key.keyValue}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {key.note}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      key.status === "active"
                        ? "bg-green-100 text-green-800"
                        : key.status === "suspended"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {key.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {key.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {key.expiresAt
                    ? new Date(key.expiresAt).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleToggleSuspend(key)}
                    title={key.status === "active" ? "Suspend" : "Activate"}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    {key.status === "active" ? ICONS.suspend : ICONS.activate}
                  </button>
                  <button
                    onClick={() => openEditModal(key)}
                    className="text-sky-600 hover:text-sky-900"
                    title="Edit"
                  >
                    {ICONS.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    {ICONS.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <KeyFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingKey={editingKey}
        />
      )}
    </div>
  );
};

const KeyFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  editingKey: Key | null;
}> = ({ isOpen, onClose, editingKey }) => {
  const { createKey, updateKey, agents } = useAdminStore();
  const [note, setNote] = useState(editingKey?.note || "");
  const [type, setType] = useState<"admin" | "agent">(
    editingKey?.type || "agent"
  );
  const [agentId, setAgentId] = useState(editingKey?.agentId || "");
  const [expiresAt, setExpiresAt] = useState(
    editingKey?.expiresAt ? editingKey.expiresAt.split("T")[0] : ""
  );
  const [neverExpires, setNeverExpires] = useState(!editingKey?.expiresAt);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalExpiresAt = neverExpires
      ? null
      : expiresAt
      ? new Date(expiresAt).toISOString()
      : null;

    if (editingKey) {
      await updateKey(editingKey.id, {
        note,
        type,
        agentId: type === "agent" ? agentId : undefined,
        expiresAt: finalExpiresAt,
      });
    } else {
      await createKey({
        note,
        type,
        agentId: type === "agent" ? agentId : undefined,
        expiresAt: finalExpiresAt,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingKey ? "Edit Key" : "Create New Key"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-slate-700"
          >
            Note
          </label>
          <input
            type="text"
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-slate-700"
          >
            Key Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
          >
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {type === "agent" && (
          <div>
            <label
              htmlFor="agentId"
              className="block text-sm font-medium text-slate-700"
            >
              Assign to Agent (Optional)
            </label>
            <select
              id="agentId"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label
            htmlFor="expiresAt"
            className="block text-sm font-medium text-slate-700"
          >
            Expires At
          </label>
          <input
            type="date"
            id="expiresAt"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            disabled={neverExpires}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm disabled:bg-slate-100"
          />
        </div>
        <div className="flex items-center">
          <input
            id="neverExpires"
            type="checkbox"
            checked={neverExpires}
            onChange={(e) => setNeverExpires(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <label
            htmlFor="neverExpires"
            className="ml-2 block text-sm text-slate-900"
          >
            Never Expires
          </label>
        </div>

        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editingKey ? "Save Changes" : "Create Key"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default KeyManagement;
