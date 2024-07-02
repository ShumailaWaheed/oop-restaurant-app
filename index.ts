#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';

// Define MenuItem class
class MenuItem {
    constructor(
        public name: string,
        public description: string,
        public price: number,
        public category: string,
        public availability: boolean = true
    ) {}
}

// Define Customer class
class Customer {
    constructor(
        public name: string,
        public email: string,
        public phone: string
    ) {}
}

// Define Order class
class Order {
    private static nextOrderId = 1;

    constructor(
        public id: number,
        public items: MenuItem[],
        public customer: Customer,
        public status: string = "pending",
        public paymentDetails?: string // Optional payment details
    ) {}

    // Static method to get the next order ID and increment
    private static getNextOrderId(): number {
        return Order.nextOrderId++;
    }

    // Create a new order instance
    static create(customer: Customer, items: MenuItem[], paymentDetails?: string): Order {
        const newOrderId = Order.getNextOrderId();
        return new Order(newOrderId, items, customer, "pending", paymentDetails);
    }

    // Calculate total price of the order
    calculateTotalPrice(): number {
        return this.items.reduce((total, item) => total + item.price, 0);
    }

    // Mark order as confirmed
    confirmOrder(): void {
        this.status = "confirmed";
    }

    // Format order details for display
    formatOrderDetails(): string {
        const customerInfo = `Customer: 
        ${this.customer.name} (${this.customer.email}, ${this.customer.phone})`;
        const itemInfo = this.items.map(item => `- ${item.name} (Rs ${item.price})`).join('\n');
        const totalPrice = `Total Price: Rs ${this.calculateTotalPrice()}`; // Display total price
        return `${customerInfo}\nItems:\n${itemInfo}\n${totalPrice}`;
    }
}

// Define Staff class
class Staff {
    constructor(
        public name: string,
        public role: string,
        public shift: string
    ) {}
}

// Define Restaurant class
class Restaurant {
    constructor(
        public name: string,
        public location: string,
        public menu: MenuItem[] = [],
        public orders: Order[] = [],
    ) {}

    // Add a new item to the menu
    addToMenu(item: MenuItem): void {
        this.menu.push(item);
    }

    // Add multiple items to the menu with prices
    addMenuItems(items: {name: string, price: number}[]): void {
        items.forEach(item => {
            const newItem = new MenuItem(item.name, "", item.price, "Main Course");
            this.addToMenu(newItem);
        });
    }

    // Create a new order
    createOrder(customer: Customer, items: MenuItem[], paymentDetails?: string): Order {
        const newOrder = Order.create(customer, items, paymentDetails);
        this.orders.push(newOrder);
        return newOrder;
    }

    // Function to prompt for item selection using Inquirer
    async promptForItemSelection(): Promise<MenuItem | null> {
        const menuChoices = this.menu.map(item => `${item.name} - Rs ${item.price}`);

        const { selectedItem } = await inquirer.prompt({
            type: 'list',
            name: 'selectedItem',
            message: 'Select an item to order:',
            choices: menuChoices,
        });

        // Find the selected item object from the menu array
        return this.menu.find(item => `${item.name} - Rs ${item.price}` === selectedItem) || null;
    }
}

// Function to display the order sign with emojis and prices in PKR
function displayOrderSign() {
    console.log(chalk.blue(`
 ┌────────────────────────────────────────────────────────────────────────┐
 │                                                                        │
 │  ● Pasta Carbonara, Spaghetti with creamy sauce     🍝     - Rs 1299   │
 │  ● Shahi Paneer, Classic Indian dessert             🧀     - Rs 1099   │
 │  ● Chicken Biryani, Pakistani chicken and rice dish 🍛     - Rs 1099   │
 │  ● Haleem, Wheat and meat porridge                  🥣     - Rs 1599   │
 │  ● Chicken Karahi, Spicy chicken curry              🍗     - Rs 1399   │
 │  ● Nihari, Slow-cooked beef stew                    🍲     - Rs 1599   │
 │  ● Rasmalai, Creamy dessert with saffron            🍮     - Rs 599    │
 │  ● Seekh Kebab, Grilled minced meat skewers         🍢     - Rs 1199   │
 │  ● Kheer, Rice pudding                              🍚     - Rs 799    │
 │  ● Aloo Palak, Potato and spinach curry             🍛     - Rs 999    |
 │                                                                        │
 └────────────────────────────────────────────────────────────────────────┘
`));
}

// Function to handle customer ordering process
async function startOrdering() {
    const restaurant = new Restaurant("Swad's Delight", "123 Main St");
    restaurant.addMenuItems([
        { name: "Pasta Carbonara", price: 1299 },
        { name: "Shahi Paneer", price: 1099 },
        { name: "Chicken Biryani", price: 1099 },
        { name: "Haleem", price: 1599 },
        { name: "Chicken Karahi", price: 1399 },
        { name: "Nihari", price: 1599 },
        { name: "Rasmalai", price: 599 },
        { name: "Seekh Kebab", price: 1199 },
        { name: "Kheer", price: 799 },
        { name: "Aloo Palak", price: 999 }
    ]);

    // Display welcome message
    console.log(chalk.yellow("\t\t*-*-*-*-*-Welcome to Swad's Delight!-*-*-*-*-*\n"));

    // Wait for 1 second before displaying the menu
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(` ------------------------------------------------------------------------ `);   

    console.log(`${chalk.bgGreenBright.bold("\t\t*-*-*-*-*-*-( MENU CARD )-*-*-*-*-*-*\n")}`);   

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Display menu card message
    displayOrderSign();

    const customerInfo = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Please enter your name:'
        },
        {
            type: 'input',
            name: 'email',
            message: 'Please enter your email:'
        },
        {
            type: 'input',
            name: 'phone',
            message: 'Please enter your phone number:'
        }
    ]);

    const customer = new Customer(customerInfo.name, customerInfo.email, customerInfo.phone);
    const orderItems: MenuItem[] = [];

    async function orderItem() {
        const selectedItem = await restaurant.promptForItemSelection();

        if (!selectedItem) {
            console.log(chalk.red("Invalid item selection. Please select a valid item from the menu."));
            await orderItem();
            return;
        }

        const quantityAnswer = await inquirer.prompt({
            type: 'input',
            name: 'quantity',
            message: `Enter quantity for ${selectedItem.name}:`,
            validate: (value) => {
                const parsedValue = parseInt(value);
                return !isNaN(parsedValue) && parsedValue > 0;
            }
        });

        const quantity = parseInt(quantityAnswer.quantity);

        for (let i = 0; i < quantity; i++) {
            orderItems.push(selectedItem);
        }

        console.log(chalk.green(`${quantity} ${selectedItem.name}(s) added to your order.`));

        const continueOrderingAnswer = await inquirer.prompt({
            type: 'confirm',
            name: 'continueOrdering',
            message: 'Do you want to add more items to your order?',
            default: false
        });

        if (continueOrderingAnswer.continueOrdering) {
            await orderItem();
        }
    }

    await orderItem();

    console.log(chalk.green("Your order summary:"));
    orderItems.forEach(item => {
        console.log(chalk.yellow(`- ${item.name}, Rs ${item.price}`));
    });

    const confirmOrderAnswer = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmOrder',
        message: 'Do you want to proceed with this order?',
        default: false
    });

    if (confirmOrderAnswer.confirmOrder) {
        const paymentAnswer = await inquirer.prompt({
            type: 'list',
            name: 'paymentMethod',
            message: 'Select your payment method:',
            choices: ['Cash on Delivery', 'Bank Account', 'Credit Card', 'EasyPaisa']
        });

        let paymentDetails = '';
        if (paymentAnswer.paymentMethod === 'Cash on Delivery') {
            paymentDetails = 'Cash on Delivery';
        } else if (paymentAnswer.paymentMethod === 'Bank Account') {
            const accountDetailsAnswer = await inquirer.prompt({
                type: 'input',
                name: 'accountNumber',
                message: 'Enter your bank account number (13 digits):',
                validate: (value) => /^\d{13}$/.test(value)
            });

            const amountToPayAnswer = await inquirer.prompt({
                type: 'input',
                name: 'amountToPay',
                message: `Enter the amount to pay (Rs ${orderItems.reduce((total, item) => total + item.price, 0)}):`,
                validate: (value) => {
                    const parsedValue = parseInt(value);
                    return !isNaN(parsedValue) && parsedValue === orderItems.reduce((total, item) => total + item.price, 0);
                }
            });

            paymentDetails = `Bank Account: 🔵${accountDetailsAnswer.accountNumber}, Amount Paid: Rs ${amountToPayAnswer.amountToPay}`;
        } else if (paymentAnswer.paymentMethod === 'Credit Card') {
            const creditCardDetailsAnswer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'creditCardNumber',
                    message: 'Enter your credit card number (16 digits):',
                    validate: (value) => /^\d{16}$/.test(value)
                },
                {
                    type: 'password',
                    name: 'pinCode',
                    message: 'Enter your 4-digit PIN code:',
                    mask: '*',
                    validate: (value) => /^\d{4}$/.test(value)
                }
            ]);

            const amountToPayAnswer = await inquirer.prompt({
                type: 'input',
                name: 'amountToPay',
                message: `Enter the amount to pay (Rs ${orderItems.reduce((total, item) => total + item.price, 0)}):`,
                validate: (value) => {
                    const parsedValue = parseInt(value);
                    return !isNaN(parsedValue) && parsedValue === orderItems.reduce((total, item) => total + item.price, 0);
                }
            });

            paymentDetails = `Credit Card: ${creditCardDetailsAnswer.creditCardNumber}, 
            Amount Paid: Rs ${amountToPayAnswer.amountToPay}`;
        } else if (paymentAnswer.paymentMethod === 'EasyPaisa') {
            const easyPaisaDetailsAnswer = await inquirer.prompt({
                type: 'input',
                name: 'easyPaisaNumber',
                message: 'Enter your EasyPaisa account number:',
                validate: (value) => /^\d+$/.test(value)
            });

            const amountToPayAnswer = await inquirer.prompt({
                type: 'input',
                name: 'amountToPay',
                message: `Enter the amount to pay (Rs ${orderItems.reduce((total, item) => total + item.price, 0)}):`,
                validate: (value) => {
                    const parsedValue = parseInt(value);
                    return !isNaN(parsedValue) && parsedValue === orderItems.reduce((total, item) => total + item.price, 0);
                }
            });

            paymentDetails = `EasyPaisa: ${easyPaisaDetailsAnswer.easyPaisaNumber}, 
            Amount Paid: Rs ${amountToPayAnswer.amountToPay}`;
        }

        const newOrder = restaurant.createOrder(customer, orderItems, paymentDetails);
        newOrder.confirmOrder();

        console.log(chalk.green(`Payment confirmed. Order placed successfully! Order ID: ${newOrder.id}`));
        console.log(chalk.yellow(newOrder.formatOrderDetails()));
        console.log(chalk.green("Thank you for placing your order!"));

        const orderManagementAnswer = await inquirer.prompt({
            type: 'list',
            name: 'orderManagement',
            message: 'Do you want to cancel or update your order?',
            choices: ['Cancel Order', 'Update Order', 'No']
        });

        if (orderManagementAnswer.orderManagement === 'Cancel Order') {
            console.log(chalk.red("Order has been cancelled."));
        } else if (orderManagementAnswer.orderManagement === 'Update Order') {
            console.log(chalk.yellow("You can update your order."));
            await orderItem();
        }
    }
}

// Start the application by starting the ordering process
startOrdering();
