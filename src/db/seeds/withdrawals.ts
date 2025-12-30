import { db } from '@/db';
import { withdrawals } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleWithdrawals = [
        // Pending withdrawals (3)
        {
            vendorId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            amount: 450.00,
            status: 'pending' as const,
            requestDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            processedDate: null,
            bankDetails: JSON.stringify({
                bankName: 'Meezan Bank',
                accountNumber: '****4521',
                routingNumber: 'MEZN0001',
                accountHolder: 'Ahmad Khan',
                accountType: 'Current'
            }),
            notes: null
        },
        {
            vendorId: 'user_02h5lyu3f9a1z4c2o8n7r6x9t5',
            amount: 875.50,
            status: 'pending' as const,
            requestDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            processedDate: null,
            bankDetails: JSON.stringify({
                bankName: 'HBL',
                accountNumber: '****7893',
                routingNumber: 'HABB0017',
                accountHolder: 'Fatima Ahmed',
                accountType: 'Savings'
            }),
            notes: null
        },
        {
            vendorId: 'user_03h6mzv4g0b2a5d3p9o8s7y0u6',
            amount: 1250.00,
            status: 'pending' as const,
            requestDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            processedDate: null,
            bankDetails: JSON.stringify({
                bankName: 'Allied Bank',
                accountNumber: '****2156',
                routingNumber: 'ABPA0010',
                accountHolder: 'Hassan Ali',
                accountType: 'Current'
            }),
            notes: null
        },

        // Approved withdrawals (5)
        {
            vendorId: 'user_04h7n0w5h1c3b6e4q0p9t8z1v7',
            amount: 2500.00,
            status: 'approved' as const,
            requestDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
            processedDate: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
            bankDetails: JSON.stringify({
                bankName: 'Bank Alfalah',
                accountNumber: '****8765',
                routingNumber: 'ALFA0001',
                accountHolder: 'Ayesha Rahman',
                accountType: 'Current'
            }),
            notes: null
        },
        {
            vendorId: 'user_05h8o1x6i2d4c7f5r1q0u9a2w8',
            amount: 1850.75,
            status: 'approved' as const,
            requestDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
            processedDate: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
            bankDetails: JSON.stringify({
                bankName: 'UBL',
                accountNumber: '****3421',
                routingNumber: 'UNBL0001',
                accountHolder: 'Muhammad Usman',
                accountType: 'Savings'
            }),
            notes: null
        },
        {
            vendorId: 'user_06h9p2y7j3e5d8g6s2r1v0b3x9',
            amount: 650.00,
            status: 'approved' as const,
            requestDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
            processedDate: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
            bankDetails: JSON.stringify({
                bankName: 'MCB Bank',
                accountNumber: '****9087',
                routingNumber: 'MUCB0227',
                accountHolder: 'Sara Malik',
                accountType: 'Current'
            }),
            notes: null
        },
        {
            vendorId: 'user_07h0q3z8k4f6e9h7t3s2w1c4y0',
            amount: 1575.25,
            status: 'approved' as const,
            requestDate: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
            processedDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            bankDetails: JSON.stringify({
                bankName: 'Faysal Bank',
                accountNumber: '****6543',
                routingNumber: 'FAYS0149',
                accountHolder: 'Ali Raza',
                accountType: 'Savings'
            }),
            notes: null
        },
        {
            vendorId: 'user_08h1r4a9l5g7f0i8u4t3x2d5z1',
            amount: 2250.50,
            status: 'approved' as const,
            requestDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
            processedDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
            bankDetails: JSON.stringify({
                bankName: 'Standard Chartered',
                accountNumber: '****1234',
                routingNumber: 'SCBL0002',
                accountHolder: 'Zainab Hussain',
                accountType: 'Current'
            }),
            notes: null
        },

        // Rejected withdrawals (4)
        {
            vendorId: 'user_09h2s5b0m6h8g1j9v5u4y3e6a2',
            amount: 350.00,
            status: 'rejected' as const,
            requestDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            processedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            bankDetails: JSON.stringify({
                bankName: 'Askari Bank',
                accountNumber: '****5678',
                routingNumber: 'ASCM0001',
                accountHolder: 'Bilal Ahmed',
                accountType: 'Savings'
            }),
            notes: 'Insufficient sales history - minimum 90 days required'
        },
        {
            vendorId: 'user_10h3t6c1n7i9h2k0w6v5z4f7b3',
            amount: 725.00,
            status: 'rejected' as const,
            requestDate: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
            processedDate: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
            bankDetails: JSON.stringify({
                bankName: 'Soneri Bank',
                accountNumber: '****9012',
                routingNumber: 'SONE0003',
                accountHolder: 'Nida Khan',
                accountType: 'Current'
            }),
            notes: 'Bank details invalid - account number verification failed'
        },
        {
            vendorId: 'user_11h4u7d2o8j0i3l1x7w6a5g8c4',
            amount: 150.00,
            status: 'rejected' as const,
            requestDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
            processedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            bankDetails: JSON.stringify({
                bankName: 'JS Bank',
                accountNumber: '****3456',
                routingNumber: 'JSBL0019',
                accountHolder: 'Kamran Iqbal',
                accountType: 'Savings'
            }),
            notes: 'Minimum withdrawal amount is $200'
        },
        {
            vendorId: 'user_12h5v8e3p9k1j4m2y8x7b6h9d5',
            amount: 1950.00,
            status: 'rejected' as const,
            requestDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            processedDate: new Date(now.getTime() - 26 * 24 * 60 * 60 * 1000),
            bankDetails: JSON.stringify({
                bankName: 'Dubai Islamic Bank',
                accountNumber: '****7890',
                routingNumber: 'DIBL0001',
                accountHolder: 'Sana Yasin',
                accountType: 'Current'
            }),
            notes: 'Account holder name does not match vendor registration details'
        }
    ];

    await db.insert(withdrawals).values(sampleWithdrawals);
    
    console.log('✅ Withdrawals seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});