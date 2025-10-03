class MovieTicket {
    String movieName;
    String theatreName;
    int seatNumber;
    double price;

    // 1. Default constructor
    MovieTicket() {
        this.movieName = "Unknown";
        this.theatreName = "Not Assigned";
        this.seatNumber = 0;
        this.price = 0.0;
    }

    // 2. Constructor with movie name
    MovieTicket(String movieName) {
        this.movieName = movieName;
        this.theatreName = "Not Assigned";
        this.seatNumber = 0;
        this.price = 200.0;
    }

    // 3. Constructor with movie name and seat number
    MovieTicket(String movieName, int seatNumber) {
        this.movieName = movieName;
        this.seatNumber = seatNumber;
        this.theatreName = "PVR";
        this.price = 200.0;
    }

    // 4. Full constructor
    MovieTicket(String movieName, String theatreName, int seatNumber, double price) {
        this.movieName = movieName;
        this.theatreName = theatreName;
        this.seatNumber = seatNumber;
        this.price = price;
    }

    void printTicket() {
        System.out.println("🎬 Movie: " + movieName + ", Theatre: " + theatreName +
                ", Seat: " + seatNumber + ", Price: ₹" + price);
    }

    public static void main(String[] args) {
        MovieTicket t1 = new MovieTicket();
        MovieTicket t2 = new MovieTicket("Inception");
        MovieTicket t3 = new MovieTicket("Avengers", 12);
        MovieTicket t4 = new MovieTicket("Oppenheimer", "INOX", 25, 350);

        t1.printTicket();
        t2.printTicket();
        t3.printTicket();
        t4.printTicket();
    }
}