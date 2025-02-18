"use client";

import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface Application {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    education: {
        school_name: string;
        end_date: number | null;
    }[];
}

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function fetchApplications() {
            try {
                const response = await fetch("/api/applications");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setApplications(data);
                setLoading(false);
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("An unknown error occurred");
                }
                setLoading(false);
            }
        }

        fetchApplications();
    }, []);

    const handleDownload = async (email: string) => {
        try {
            const response = await fetch(`/api/download?email=${encodeURIComponent(email)}`);
            console.log("Hello World");
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${email}-resume.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                if (response.status === 404) {
                    setErrorMessage("Resume not found for this applicant.");
                    setModalOpen(true);
                } else {
                    setErrorMessage("Download failed.");
                    setModalOpen(true);
                    console.error("Download failed");
                }
            }
        } catch (e) {
            setErrorMessage("Download failed.");
            setModalOpen(true);
            console.error("Download failed", e);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setErrorMessage("");
    };

    if (loading) {
        return <div>Loading applications...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
                <Table className="min-w-full divide-y divide-gray-300">
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">ID</TableHead>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">Name</TableHead>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">Email</TableHead>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">University</TableHead>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">Grad Year</TableHead>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">Resume</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                        {applications.map((app: Application, index: number) => (
                            <TableRow key={app._id} className="hover:bg-gray-50">
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{index + 1}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{app.first_name + " " + app.last_name}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{app.email}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{app.education[0].school_name}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{app.education[0].end_date ? new Date(app.education[0].end_date * 1000).getFullYear() : "-"}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    <button onClick={() => handleDownload(app.email)} className="text-blue-600 hover:text-blue-900">
                                        Download Resume
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Error</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">{errorMessage}</p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button onClick={closeModal} className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
                                    Okay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
