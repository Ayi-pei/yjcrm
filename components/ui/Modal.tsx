
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ICONS } from '../../constants';
import { designSystem } from '../../styles/design-system';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden ${designSystem.borderRadius.xl} bg-white p-6 text-left align-middle ${designSystem.shadows.xl} transition-all border border-slate-100`}>
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900 flex justify-between items-center">
                  {title}
                  <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    {ICONS.close}
                  </button>
                </Dialog.Title>
                <div className="mt-4">
                  {children}
                </div>
                {footer && (
                  <div className="mt-6 flex justify-end space-x-2">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
