class Book {
    String title;
    String author;
    String isbn;
    boolean isAvailable;

    // 1. Default constructor
    Book() {
        this.title = "";
        this.author = "";
        this.isbn = "";
        this.isAvailable = true;
    }

    // 2. Constructor with title and author
    Book(String title, String author) {
        this.title = title;
        this.author = author;
        this.isbn = "Not Assigned";
        this.isAvailable = true;
    }

    // 3. Full constructor
    Book(String title, String author, String isbn, boolean isAvailable) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.isAvailable = isAvailable;
    }

    void borrowBook() {
        if (isAvailable) {
            isAvailable = false;
            System.out.println(title + " has been borrowed.");
        } else {
            System.out.println(title + " is not available.");
        }
    }

    void returnBook() {
        isAvailable = true;
        System.out.println(title + " has been returned.");
    }

    void displayBookInfo() {
        System.out.println("📖 Title: " + title + ", Author: " + author +
                ", ISBN: " + isbn + ", Available: " + isAvailable);
    }

    public static void main(String[] args) {
        
        Book b2 = new Book("1984", "George Orwell");
        Book b3 = new Book("Java Basics", "James Gosling", "12345", true);

        b2.displayBookInfo();
        b3.displayBookInfo();

        b3.borrowBook();
        b3.displayBookInfo();

        b3.returnBook();
        b3.displayBookInfo();
    }
}
