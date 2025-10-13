import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import type { Message } from '../types';
import Header from './Header';
import MessageTable from './MessageTable';
import Spinner from './Spinner';
import ConfirmationModal from './ConfirmationModal';
import Notifications from './Notifications';

const Dashboard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');

  useEffect(() => {
    if (activeTab !== 'messages') {
        if(messages.length === 0) {
            setLoading(true);
        }
        return;
    };

    const q = query(collection(db, 'contacts'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData: Message[] = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as Message;
      });

      messagesData.sort((a, b) => {
        if (a.submittedAt && b.submittedAt) {
            return b.submittedAt.toMillis() - a.submittedAt.toMillis();
        }
        return 0;
      });

      setMessages(messagesData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching messages: ", err);
      setError("Failed to fetch messages. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleExportToCsv = () => {
    if (messages.length === 0) return;

    const formatDate = (timestamp: Timestamp) => {
      if (!timestamp || typeof timestamp.toDate !== 'function') {
        return 'Invalid Date';
      }
      return timestamp.toDate().toLocaleString();
    };

    const escapeCsvField = (field: string) => {
      if (field === null || field === undefined) {
        return '""';
      }
      const stringField = String(field);
      return `"${stringField.replace(/"/g, '""')}"`;
    };

    const headers = ['ID', 'Name', 'Email', 'Message', 'Submitted At'];
    const csvRows = [
      headers.join(','),
      ...messages.map(msg => [
        escapeCsvField(msg.id),
        escapeCsvField(msg.name),
        escapeCsvField(msg.email),
        escapeCsvField(msg.message),
        escapeCsvField(formatDate(msg.submittedAt))
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contact-messages.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteClick = (message: Message) => {
    setMessageToDelete(message);
  };

  const handleConfirmDelete = async () => {
    if (messageToDelete) {
      try {
        const messageDocRef = doc(db, 'contacts', messageToDelete.id);
        await deleteDoc(messageDocRef);
        setMessageToDelete(null);
      } catch (err) {
        console.error("Error deleting message: ", err);
        setError("Failed to delete message.");
      }
    }
  };

  const handleCancelDelete = () => {
    setMessageToDelete(null);
  };
  
  const renderMessagesContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }
    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }
    if (messages.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No messages yet.</p>;
    }
    return <MessageTable messages={messages} onDelete={handleDeleteClick} />;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
           <div className="border-b border-gray-200 dark:border-gray-700">
             <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`${
                    activeTab === 'messages'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                  aria-current={activeTab === 'messages' ? 'page' : undefined}
                >
                  Messages
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`${
                    activeTab === 'notifications'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                   aria-current={activeTab === 'notifications' ? 'page' : undefined}
                >
                  Notifications
                </button>
             </nav>
           </div>
          
          {activeTab === 'messages' && (
            <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-4">
                   <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Contact Form Submissions</h2>
                   <button
                      onClick={handleExportToCsv}
                      disabled={messages.length === 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                      Export to CSV
                    </button>
               </div>
               {renderMessagesContent()}
            </div>
           )}

           {activeTab === 'notifications' && <Notifications />}
        </div>
      </main>
      {messageToDelete && (
        <ConfirmationModal
          message={`Are you sure you want to delete the message from "${messageToDelete.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
};

export default Dashboard;
