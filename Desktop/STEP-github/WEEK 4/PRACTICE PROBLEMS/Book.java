public class Book {
    String title;
    String author;
    double price;

    // Default constructor
    public Book() {
        this.title = "Unknown Title";
        this.author = "Unknown Author";
        this.price = 0.0;
    }

    // Parameterized constructor
    public Book(String title, String author, double price) {
        this.title = title;
        this.author = author;
        this.price = price;
    }

    // Display method
    public void display() {
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Price: $" + price);
    }

    public static void main(String[] args) {
        // Create book1 using default constructor
        Book book1 = new Book();
        // Create book2 using parameterized constructor
        Book book2 = new Book("The Great Gatsby", "F. Scott Fitzgerald", 10.99);

        // Display both books
        System.out.println("Book 1 (Default Constructor):");
        book1.display();
        System.out.println();
        System.out.println("Book 2 (Parameterized Constructor):");
        book2.display();
    }
}