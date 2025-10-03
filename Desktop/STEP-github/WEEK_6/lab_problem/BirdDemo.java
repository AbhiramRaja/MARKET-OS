package lab_problem;

public class BirdDemo {
    public static void main(String[] args) {
        Bird[] birds = { new Penguin(), new Eagle() };
        for (Bird b : birds) {
            b.fly();
        }
    }
}

class Bird {
    public void fly() {
        System.out.println("Bird is flying");
    }
}

class Penguin extends Bird {
    @Override
    public void fly() {
        System.out.println("Penguin cannot fly, it swims");
    }
}

class Eagle extends Bird {
    @Override
    public void fly() {
        System.out.println("Eagle soars high");
    }
}
