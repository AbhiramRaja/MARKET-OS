class SmartDevice {
    protected String name;
    public SmartDevice(String name) {
        this.name = name;
    }
    public void turnOn() {
        System.out.println(name + " is turned on");
    }
    public void turnOff() {
        System.out.println(name + " is turned off");
    }
}
class SmartLight extends SmartDevice {
    public SmartLight(String name) {
        super(name);
    }
    public void changeColor(String color) {
        System.out.println(name + " is changing color to " + color);
    }
}
class SmartSpeaker extends SmartDevice {
    public SmartSpeaker(String name) {
        super(name);
    }
    public void playMusic(String song) {
        System.out.println(name + " is playing: " + song);
    }
}
public class SmartHome {
    public static void main(String[] args) {
        SmartDevice[] devices = {
            new SmartLight("Living Room Light"),
            new SmartSpeaker("Bedroom Speaker")
        };
        for (SmartDevice d : devices) {
            d.turnOn();
            if (d instanceof SmartLight) ((SmartLight) d).changeColor("Blue");
            else if (d instanceof SmartSpeaker) ((SmartSpeaker) d).playMusic("Shape of You");
        }
    }
}
