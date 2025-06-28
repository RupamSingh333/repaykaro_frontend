"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Buffer } from 'buffer';

interface CustomerDetails {
    name: string;
    email: string;
    phone: string;
    address?: string;
    // Add other customer fields as needed
}

export default function UserMetaCard() {
    const params = useParams();
    const [decodedPhone, setDecodedPhone] = useState('');
    const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { admin } = useAuth();

    useEffect(() => {
        const fetchCustomerDetails = async (phone: string) => {
            try {
                setLoading(true);
                const trimPhone = phone.trim();
                const response = await fetch(`/api/admin/customers/${trimPhone}`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok) {
                    throw new Error('Customer not found');
                }
                const data = await response.json();
                setCustomerDetails(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch customer');
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (params?.encodedPhone) {
            try {
                // Clean and decode the phone number
                const cleanBase64 = (params.encodedPhone as string)
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');

                const decoded = Buffer.from(cleanBase64, 'base64').toString('ascii');
                const cleanPhone = decoded.replace(/\D/g, ''); // Remove non-digits

                setDecodedPhone(cleanPhone);

                // Fetch customer details after decoding
                fetchCustomerDetails(params.encodedPhone as string);
            } catch (err) {
                setDecodedPhone('Invalid phone');
                console.error('Decoding error:', err);
            }
        }
    }, [params]);

    if (loading) {
        return <div className="p-5">Loading customer details...</div>;
    }

    if (error) {
        return <div className="p-5 text-red-500">Error: {error}</div>;
    }

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                        <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                            <Image
                                width={80}
                                height={80}
                                src="/images/user/owner.jpg"
                                alt="user"
                            />
                        </div>
                        <div className="order-3 xl:order-2">
                            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                                {customerDetails?.name || admin?.name}
                            </h4>
                            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {decodedPhone}
                                </p>
                                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {customerDetails?.address || 'Arizona, United States'}
                                </p>
                            </div>
                        </div>
                        {/* ... rest of your social media buttons ... */}
                    </div>
                    {/* ... rest of your component ... */}
                </div>
            </div>

            <div className="mt-3 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                            Personal Information
                        </h4>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    First Name
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {customerDetails?.name || admin?.name}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Email address
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {customerDetails?.email || admin?.email}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Phone
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {decodedPhone}
                                </p>
                            </div>
                            {/* ... other fields ... */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}