class Weather {
    Weather() {
        System.out.println("Weather created");
    }
    void display() {
        System.out.println("General weather");
    }
}

class Storm extends Weather {
    Storm() {
        super();
        System.out.println("Storm created");
    }
    void display() {
        System.out.println("Stormy weather");
    }
}

class Thunderstorm extends Storm {
    Thunderstorm() {
        super();
        System.out.println("Thunderstorm created");
    }
    void display() {
        System.out.println("Thunderstorm weather");
    }
}

class Sunshine extends Weather {
    Sunshine() {
        super();
        System.out.println("Sunshine created");
    }
    void display() {
        System.out.println("Sunny weather");
    }
    public static void main(String[] args) {
        Weather[] arr = {new Weather(), new Storm(), new Thunderstorm(), new Sunshine()};
        for (Weather w : arr) {
            w.display();
        }
    }
}
