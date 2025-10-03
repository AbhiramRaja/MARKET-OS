class Vehicle {
    public void dispatch() {
        System.out.println("Generic vehicle dispatched");
    }
}
class Bus extends Vehicle {
    @Override
    public void dispatch() {
        System.out.println("Bus dispatched: Fixed route with 50 passengers capacity");
    }
}
class Taxi extends Vehicle {
    @Override
    public void dispatch() {
        System.out.println("Taxi dispatched: Door-to-door service, fare calculated by distance");
    }
}
class Train extends Vehicle {
    @Override
    public void dispatch() {
        System.out.println("Train dispatched: Scheduled service with 10 cars capacity");
    }
}
class Bike extends Vehicle {
    @Override
    public void dispatch() {
        System.out.println("Bike dispatched: Short-distance eco-friendly ride");
    }
}
public class TransportSystem {
    public static void main(String[] args) {
        Vehicle[] fleet = { new Bus(), new Taxi(), new Train(), new Bike() };
        for (Vehicle v : fleet) v.dispatch();
    }
}
