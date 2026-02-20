export const runtime = 'edge';
/**
 * Example API Route with Comprehensive Error Handling
 * This example shows best practices for implementing error handling in API routes
 */

import { NextRequest } from 'next/server';
import {
    withApiErrorHandler,
    apiSuccess,
    validationError,
    authError,
    notFoundError,
    databaseError
} from '@/lib/api-errors';
import { validateSchema, validateEmail } from '@/lib/validation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export const runtime = 'edge';


// Example: Order Creation API Route

interface CreateOrderRequest {
    customerEmail: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    deliveryAddress: string;
    phoneNumber: string;
}

/**
 * POST /api/example/orders
 * Create a new order with full validation and error handling
 */
export const POST = withApiErrorHandler(async (req: NextRequest) => {
    // 1. Parse request body
    const body = await req.json();

    // 2. Validate input schema
    const validation = validateSchema<CreateOrderRequest>(body, {
        customerEmail: {
            required: true,
            validator: validateEmail,
            sanitizer: (v) => v.trim().toLowerCase()
        },
        items: {
            required: true,
            type: 'array',
            validator: (items) => {
                if (!Array.isArray(items) || items.length === 0) {
                    return { isValid: false, errors: ['At least one item is required'] };
                }
                if (items.length > 50) {
                    return { isValid: false, errors: ['Maximum 50 items allowed'] };
                }
                return { isValid: true, errors: [] };
            }
        },
        deliveryAddress: {
            required: true,
            type: 'string',
            validator: (addr) => {
                if (addr.length < 10) {
                    return { isValid: false, errors: ['Address too short'] };
                }
                if (addr.length > 500) {
                    return { isValid: false, errors: ['Address too long'] };
                }
                return { isValid: true, errors: [] };
            }
        },
        phoneNumber: {
            required: true,
            type: 'string'
        }
    });

    if (!validation.isValid) {
        return validationError(validation.errors.join(', '));
    }

    const sanitizedData = validation.sanitized!;

    // 3. Check authentication (example - adapt to your auth system)
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return authError('Authentication required');
    }

    // 4. Check if customer exists (example database query)
    try {
        const customersRef = collection(db, 'customers');
        const q = query(customersRef, where('email', '==', sanitizedData.customerEmail));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return notFoundError('Customer', {
                email: sanitizedData.customerEmail
            });
        }

        const customer = snapshot.docs[0].data();

        // 5. Validate stock availability for each item
        for (const item of sanitizedData.items) {
            const productDoc = await getDocs(
                query(collection(db, 'products'), where('__name__', '==', item.productId))
            );

            if (productDoc.empty) {
                return notFoundError('Product', {
                    productId: item.productId
                });
            }

            const product = productDoc.docs[0].data();
            if (product.stock < item.quantity) {
                return validationError(
                    `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                );
            }
        }

        // 6. Create the order
        const order = {
            customerId: snapshot.docs[0].id,
            customerEmail: sanitizedData.customerEmail,
            items: sanitizedData.items,
            deliveryAddress: sanitizedData.deliveryAddress,
            phoneNumber: sanitizedData.phoneNumber,
            status: 'pending',
            createdAt: new Date().toISOString(),
            total: 0 // Calculate total based on items
        };

        const ordersRef = collection(db, 'orders');
        const orderDoc = await addDoc(ordersRef, order);

        // 7. Return success response
        return apiSuccess({
            orderId: orderDoc.id,
            status: 'created',
            message: 'Order created successfully',
            order: {
                id: orderDoc.id,
                ...order
            }
        }, 201); // 201 Created status code

    } catch (error) {
        // Database errors are caught and handled
        return databaseError(error, 'createOrder', {
            customerEmail: sanitizedData.customerEmail,
            itemCount: sanitizedData.items.length
        });
    }
});

/**
 * GET /api/example/orders
 * List orders with error handling and pagination
 */
export const GET = withApiErrorHandler(async (req: NextRequest) => {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination parameters
    if (page < 1 || page > 1000) {
        return validationError('Page must be between 1 and 1000');
    }

    if (limit < 1 || limit > 100) {
        return validationError('Limit must be between 1 and 100');
    }

    try {
        // Fetch orders
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef);

        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedOrders = orders.slice(startIndex, endIndex);

        return apiSuccess({
            orders: paginatedOrders,
            pagination: {
                page,
                limit,
                total: orders.length,
                totalPages: Math.ceil(orders.length / limit),
                hasNext: endIndex < orders.length,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        return databaseError(error, 'listOrders', { page, limit });
    }
});

/**
 * Example: How to use this API from the client
 */
const exampleUsage = `
// Client-side usage example:

import { useToast } from '@/components/ToastProvider';

function OrderForm() {
    const toast = useToast();

    const handleSubmit = async (data) => {
        try {
            const response = await fetch('/api/example/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_TOKEN'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                toast.success(\`Order created! ID: \${result.data.orderId}\`);
                // Handle success
            } else {
                toast.error(result.error.userMessage);
                // Handle error
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
            console.error(error);
        }
    };

    return (
        // Your form JSX
    );
}
`;
