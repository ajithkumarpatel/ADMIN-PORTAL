import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Notification } from '../types';
import Spinner from './Spinner';

const BellIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);


const Gemini: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            setError("Could not load updates at this time. Please check back later.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp || typeof timestamp.toDate !== 'function') {
            return 'Sending...';
        }
        return timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center py-20"><Spinner /></div>;
        }
        if (error) {
            return <p className="text-center text-red-500 p-6">{error}</p>;
        }
        if (notifications.length === 0) {
            return <p className="text-center text-gray-500 dark:text-gray-400 p-10">No new updates right now. Check back soon!</p>;
        }
        return (
             <div className="space-y-6">
                {notifications.map((notification) => (
                    <div key={notification.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 transition-transform transform hover:scale-105">
                        <div className="flex justify-between items-start">
                             <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{notification.title}</h3>
                             <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(notification.timestamp)}</span>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{notification.message}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
            <header className="text-center mb-10">
                <div className="flex items-center justify-center text-gray-800 dark:text-white">
                    <BellIcon />
                    <h1 className="text-4xl font-extrabold tracking-tight">Latest Updates</h1>
                </div>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">News and announcements, delivered directly from me to you.</p>
            </header>
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default Gemini;