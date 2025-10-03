package lab_problem;

public class FruitDemo {
    public static void main(String[] args) {
        Apple a = new Apple("Red", "Sweet", "Fuji");
        System.out.println(a.color + " " + a.taste + " " + a.variety);
    }
}

class Fruit {
    protected String color;
    protected String taste;
    public Fruit(String color, String taste) {
        this.color = color;
        this.taste = taste;
    }
}

class Apple extends Fruit {
    protected String variety;
    public Apple(String color, String taste, String variety) {
        super(color, taste);
        this.variety = variety;
    }
}

