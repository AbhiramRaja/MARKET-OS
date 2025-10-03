import java.util.Random;

class BankAccount {
    String accountHolder;
    int accountNumber;
    double balance;

    // 1. Default constructor
    BankAccount() {
        this.accountHolder = "Unknown";
        this.accountNumber = 0;
        this.balance = 0.0;
    }

    // 2. Constructor with name
    BankAccount(String accountHolder) {
        this.accountHolder = accountHolder;
        this.accountNumber = new Random().nextInt(9000) + 1000; // random 4-digit number
        this.balance = 0.0;
    }

    // 3. Constructor with name & initial balance
    BankAccount(String accountHolder, double balance) {
        this.accountHolder = accountHolder;
        this.accountNumber = new Random().nextInt(9000) + 1000;
        this.balance = balance;
    }

    void deposit(double amount) {
        balance += amount;
        System.out.println("Deposited: ₹" + amount);
    }

    void withdraw(double amount) {
        if (amount <= balance) {
            balance -= amount;
            System.out.println("Withdrawn: ₹" + amount);
        } else {
            System.out.println("❌ Insufficient balance");
        }
    }

    void displayAccount() {
        System.out.println("👤 Holder: " + accountHolder + ", Acc#: " + accountNumber +
                ", Balance: ₹" + balance);
    }

    public static void main(String[] args) {
        BankAccount acc1 = new BankAccount("Alice");
        BankAccount acc2 = new BankAccount("Bob", 5000);

        acc1.displayAccount();
        acc2.displayAccount();

        acc2.deposit(2000);
        acc2.withdraw(1000);
        acc2.displayAccount();
    }
}
