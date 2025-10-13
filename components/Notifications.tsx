import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import type { Notification } from '../types';
import Spinner from './Spinner';
import ConfirmationModal from './ConfirmationModal';
import TrashIcon from './icons/TrashIcon';


const Notifications: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState('');

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

    useEffect(() => {
        const notificationsCollectionRef = collection(db, 'notifications');
        const q = query(notificationsCollectionRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const notificationsData: Notification[] = querySnapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() } as Notification;
            });
            setNotifications(notificationsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching notifications: ", err);
            setListError("Failed to fetch notifications. Please try again later.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            setFormError('Title and message cannot be empty.');
            return;
        }
        setFormError('');
        setSending(true);
        try {
            const notificationsCollectionRef = collection(db, 'notifications');
            await addDoc(notificationsCollectionRef, {
                title,
                message,
                timestamp: serverTimestamp()
            });
            setTitle('');
            setMessage('');
        } catch (err) {
            console.error(err);
            setFormError('Failed to send notification. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteClick = (notification: Notification) => {
      setNotificationToDelete(notification);
    };

    const handleConfirmDelete = async () => {
      if (notificationToDelete) {
        try {
          const notificationDocRef = doc(db, 'notifications', notificationToDelete.id);
          await deleteDoc(notificationDocRef);
          setNotificationToDelete(null);
        } catch (err) {
          console.error("Error deleting notification: ", err);
          setListError("Failed to delete notification.");
        }
      }
    };

    const handleCancelDelete = () => {
      setNotificationToDelete(null);
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp || typeof timestamp.toDate !== 'function') {
            return 'Just now';
        }
        return timestamp.toDate().toLocaleString();
    };

    const renderNotificationList = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-64"><Spinner /></div>;
        }
        if (listError) {
            return <p className="text-center text-red-500 p-6">{listError}</p>;
        }
        if (notifications.length === 0) {
            return <p className="text-center text-gray-500 dark:text-gray-400 p-6">No notifications sent yet.</p>;
        }
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Message</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sent At</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification) => (
                            <tr key={notification.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{notification.title}</td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300 max-w-sm break-words">{notification.message}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(notification.timestamp)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDeleteClick(notification)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        aria-label={`Delete notification titled ${notification.title}`}
                                    >
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Send New Notification</h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Notification Title"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Your notification message here..."
                    ></textarea>
                </div>

                {formError && <p className="text-sm text-red-500">{formError}</p>}
                
                <div>
                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                        {sending ? 'Sending...' : 'Send Notification'}
                    </button>
                </div>
            </form>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sent Notifications</h3>
            </div>
            {renderNotificationList()}
        </div>
         {notificationToDelete && (
            <ConfirmationModal
              message={`Are you sure you want to delete the notification titled "${notificationToDelete.title}"?`}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
        )}
        </>
    );
};

export default Notifications;