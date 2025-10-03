package lab_problem;

public class PhoneDemo {
    public static void main(String[] args) {
        SmartPhone s1 = new SmartPhone("Samsung", "Galaxy", "Android");
        SmartPhone s2 = new SmartPhone("Apple", "iPhone", "iOS");
    }
}

class Phone {
    protected String brand;
    protected String model;
    public Phone(String brand, String model) {
        this.brand = brand;
        this.model = model;
        System.out.println("Phone constructor: " + brand + " " + model);
    }
}

class SmartPhone extends Phone {
    protected String operatingSystem;
    public SmartPhone(String brand, String model, String operatingSystem) {
        super(brand, model);
        this.operatingSystem = operatingSystem;
        System.out.println("SmartPhone constructor: " + operatingSystem);
    }
}
