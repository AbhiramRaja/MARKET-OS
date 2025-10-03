class SmartDevice {
    protected String name;
    public SmartDevice(String name) {
        this.name = name;
    }
    public void turnOn() {
        System.out.println(name + " turned on");
    }
}
class SmartTV extends SmartDevice {
    public SmartTV(String name) {
        super(name);
    }
    public void changeChannel(int channel) {
        System.out.println(name + " switched to channel " + channel);
    }
}
class SmartThermostat extends SmartDevice {
    public SmartThermostat(String name) {
        super(name);
    }
    public void setTemperature(int temp) {
        System.out.println(name + " set temperature to " + temp);
    }
}
class SmartSecurity extends SmartDevice {
    public SmartSecurity(String name) {
        super(name);
    }
    public void activateAlarm() {
        System.out.println(name + " alarm activated");
    }
}
class SmartKitchen extends SmartDevice {
    public SmartKitchen(String name) {
        super(name);
    }
    public void startCooking(String recipe) {
        System.out.println(name + " started cooking " + recipe);
    }
}
public class SmartHomeAutomation {
    public static void main(String[] args) {
        SmartDevice[] devices = {
            new SmartTV("Living Room TV"),
            new SmartThermostat("Nest Thermostat"),
            new SmartSecurity("Ring Security"),
            new SmartKitchen("Smart Oven")
        };
        for (SmartDevice d : devices) {
            d.turnOn();
            if (d instanceof SmartTV) ((SmartTV) d).changeChannel(5);
            else if (d instanceof SmartThermostat) ((SmartThermostat) d).setTemperature(22);
            else if (d instanceof SmartSecurity) ((SmartSecurity) d).activateAlarm();
            else if (d instanceof SmartKitchen) ((SmartKitchen) d).startCooking("Pasta");
        }
    }
}
