
class Light {
    Light() {
        this("Default Light");
    }
    Light(String type) {
        this(type, 0);
    }
    Light(String type, int brightness) {
        System.out.println("Light: " + type + " with brightness " + brightness);
    }
}

class LED extends Light {
    LED() {
        super("LED", 100);
        System.out.println("LED: Default Constructor");
    }
    LED(String type) {
        this(type, 200);
        System.out.println("LED: Type Constructor");
    }
    LED(String type, int brightness) {
        super(type, brightness);
        System.out.println("LED: Type and Brightness Constructor");
    }
    public static void main(String[] args) {
        new Light();
        new LED();
        new LED("LED Bulb");
        new LED("LED Tube", 300);
    }
}
