
import React from 'react';
import { type Customer } from '../../types';

interface CustomerDetailsProps {
  customer: Customer | null;
}

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500 font-medium">{label}</p>
    <p className="text-sm text-slate-800">{value}</p>
  </div>
);

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer }) => {
  if (!customer) {
    return (
      <div className="w-80 border-l border-slate-200 p-6 flex items-center justify-center">
        <p className="text-slate-500">No customer selected</p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col">
      <div className="p-6 text-center border-b border-slate-200">
        <img className="h-24 w-24 rounded-full object-cover mx-auto" src={customer.avatarUrl} alt={customer.name} />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">{customer.name}</h3>
        <p className="text-sm text-slate-500">{customer.id}</p>
      </div>
      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Customer Info</h4>
        <DetailItem label="Status" value={customer.isOnline ? 'Online' : `Offline (last seen ${new Date(customer.lastSeen).toLocaleString()})`} />
        <DetailItem label="IP Address" value={customer.ipAddress} />
        <DetailItem label="Device Info" value={customer.deviceInfo} />
      </div>
       <div className="p-4 border-t border-slate-200">
          <p className="text-xs text-center text-slate-400">More tools and integrations coming soon.</p>
       </div>
    </div>
  );
};

export default CustomerDetails;
