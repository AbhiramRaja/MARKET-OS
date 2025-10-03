class MedicalStaff {
    protected String name;
    public MedicalStaff(String name) {
        this.name = name;
    }
    public void shiftSchedule() {
        System.out.println(name + " is scheduled for shift");
    }
    public void accessID() {
        System.out.println(name + " accessed hospital with ID");
    }
    public void processPayroll() {
        System.out.println(name + " payroll processed");
    }
}
class Doctor extends MedicalStaff {
    public Doctor(String name) {
        super(name);
    }
    public void diagnose() {
        System.out.println(name + " diagnosed a patient");
    }
}
class Nurse extends MedicalStaff {
    public Nurse(String name) {
        super(name);
    }
    public void monitorPatient() {
        System.out.println(name + " monitored a patient");
    }
}
class Technician extends MedicalStaff {
    public Technician(String name) {
        super(name);
    }
    public void operateEquipment() {
        System.out.println(name + " operated equipment");
    }
}
class Administrator extends MedicalStaff {
    public Administrator(String name) {
        super(name);
    }
    public void manageRecords() {
        System.out.println(name + " managed records");
    }
}
public class HospitalSystem {
    public static void main(String[] args) {
        MedicalStaff s = new Doctor("Dr. Smith");
        s.shiftSchedule();
        s.accessID();
        s.processPayroll();
    }
}
