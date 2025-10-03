import java.time.LocalDate;
import java.util.*;

final class MedicalRecord {
    private final String recordId;
    private final String patientDNA;
    private final String[] allergies;
    private final String[] medicalHistory;
    private final LocalDate birthDate;
    private final String bloodType;

    public MedicalRecord(String recordId, String patientDNA, String[] allergies, String[] medicalHistory,
                         LocalDate birthDate, String bloodType) {
        this.recordId = recordId;
        this.patientDNA = patientDNA;
        this.allergies = Arrays.copyOf(allergies, allergies.length);
        this.medicalHistory = Arrays.copyOf(medicalHistory, medicalHistory.length);
        this.birthDate = birthDate;
        this.bloodType = bloodType;
    }

    public String getRecordId() { return recordId; }
    public String getPatientDNA() { return patientDNA; }
    public String[] getAllergies() { return Arrays.copyOf(allergies, allergies.length); }
    public String[] getMedicalHistory() { return Arrays.copyOf(medicalHistory, medicalHistory.length); }
    public LocalDate getBirthDate() { return birthDate; }
    public String getBloodType() { return bloodType; }
    public final boolean isAllergicTo(String substance) {
        for(String a : allergies) if(a.equalsIgnoreCase(substance)) return true;
        return false;
    }
}

class Patient {
    private String currentName;
    private int roomNumber;

    Patient(String name, int roomNumber) {
        this.currentName = name;
        this.roomNumber = roomNumber;
    }

    String getBasicInfo() { return currentName + " - Room: " + roomNumber; }
    public String getPublicInfo() { return currentName + " - Room: " + roomNumber; }
}

class Doctor {
    private String name;
    Doctor(String name) { this.name = name; }
}

class HospitalSystem {
    private final Map<String, Object> patientRegistry = new HashMap<>();
    public boolean admitPatient(Object patient, Object staff) { return true; }
}

public class SystemsPartA {
    public static void main(String[] args) {
        Patient p = new Patient("John Doe", 101);
        System.out.println(p.getPublicInfo());
    }
}
