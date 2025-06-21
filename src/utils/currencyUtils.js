export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR', // Assuming your currency is Indian Rupees
    }).format(amount);
};