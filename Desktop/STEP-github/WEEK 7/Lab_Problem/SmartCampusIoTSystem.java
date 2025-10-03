class Device { }
class SmartClassroom extends Device {
    void control() { System.out.println("Smart Classroom: Lights and AC controlled."); }
}
class SmartLab extends Device {
    void control() { System.out.println("Smart Lab: Equipment and safety monitored."); }
}
class SmartLibrary extends Device {
    void control() { System.out.println("Smart Library: Tracks occupancy and books."); }
}
class SmartCampusIoTSystem {
    public static void main(String[] args) {
        Device[] devices = {new SmartClassroom(), new SmartLab(), new SmartLibrary()};
        for (Device d : devices) {
            if (d instanceof SmartClassroom) ((SmartClassroom)d).control();
            else if (d instanceof SmartLab) ((SmartLab)d).control();
            else if (d instanceof SmartLibrary) ((SmartLibrary)d).control();
        }
    }
}
