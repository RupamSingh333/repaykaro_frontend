import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
    request: Request,
    { params }: { params: { phoneNumber: string } }
) {
    try {
        const adminToken = (await cookies()).get('admin_token')?.value;


        if (!adminToken) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Admin token missing.' },
                { status: 401 }
            );
        }

        const phoneNumber = await params.phoneNumber.trim();

        if (!phoneNumber) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: user ID.' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/customers/${phoneNumber}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // Important for dynamic data
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                {
                    success: false,
                    message: errorData?.message || 'Failed to fetch customer.',
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result, { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Fetch customer error:', errorMessage);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error while fetching customer data.',
            },
            { status: 500 }
        );
    }
}