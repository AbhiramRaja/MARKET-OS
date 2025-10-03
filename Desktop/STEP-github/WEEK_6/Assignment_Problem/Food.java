abstract class Food {
    public final void prepare() {
        wash();
        cook();
        serve();
    }
    abstract void wash();
    abstract void cook();
    abstract void serve();
}

class Pizza extends Food {
    void wash() {
        System.out.println("Washing vegetables");
    }
    void cook() {
        System.out.println("Baking pizza");
    }
    void serve() {
        System.out.println("Serving pizza");
    }
}

class Soup extends Food {
    void wash() {
        System.out.println("Washing ingredients");
    }
    void cook() {
        System.out.println("Boiling soup");
    }
    void serve() {
        System.out.println("Serving soup");
    }
    public static void main(String[] args) {
        Food f1 = new Pizza();
        f1.prepare();
        Food f2 = new Soup();
        f2.prepare();
    }
}
