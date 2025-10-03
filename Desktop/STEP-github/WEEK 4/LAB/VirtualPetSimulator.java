// VirtualPetSimulator.java
import java.util.*;

public class VirtualPetSimulator {
    public static void main(String[] args) {
        PetDaycare daycare = new PetDaycare("Happy Paws Daycare");
        VirtualPet p1 = new VirtualPet();
        VirtualPet p2 = new VirtualPet("Luna");
        VirtualPet p3 = new VirtualPet("Rex", "Canine");
        VirtualPet p4 = new VirtualPet("Nova", "Feline", 2, 55, 60, "Child");
        daycare.addPet(p1);
        daycare.addPet(p2);
        daycare.addPet(p3);
        daycare.addPet(p4);
        for (int day = 1; day <= 7; day++) {
            for (VirtualPet pet : daycare.getAllPets()) {
                try {
                    if (day % 2 == 0) pet.feedPet(10);
                    if (day % 3 == 0) pet.playWithPet(12);
                    if (pet.getHealth() < 35) pet.healPet(15);
                    pet.simulateDay();
                    pet.evolvePet();
                } catch (PetInactiveException e) {
                } catch (RuntimeException e) {
                }
            }
        }
        daycare.printReport();
        System.out.println("Total pets: " + VirtualPet.getTotalPetsCreated());
    }
}

class PetInactiveException extends Exception {
    public PetInactiveException(String message) { super(message); }
}

class VirtualPet {
    private final String petId;
    private String petName;
    private String species;
    private int age;
    private int happiness;
    private int health;
    private String stage;
    private boolean isGhost;
    public static final String[] EVOLUTION_STAGES = {"Egg", "Baby", "Child", "Teen", "Adult", "Elder"};
    private static int totalPetsCreated = 0;
    private static final List<String> SPECIES_POOL = Arrays.asList("Feline", "Canine", "Drake", "Sprite", "Slime", "Avian");
    public VirtualPet() { this("Mystery", randomSpecies(), 0, 50, 50, "Egg"); }
    public VirtualPet(String petName) { this(petName, randomSpecies(), 0, 55, 55, "Baby"); }
    public VirtualPet(String petName, String species) { this(petName, species, 1, 60, 60, "Child"); }
    public VirtualPet(String petName, String species, int age, int happiness, int health, String stage) {
        this.petId = generatePetId();
        this.petName = petName;
        this.species = species;
        this.age = Math.max(0, age);
        this.happiness = clamp(happiness, 0, 100);
        this.health = clamp(health, 0, 100);
        this.stage = normalizeStage(stage);
        this.isGhost = false;
        totalPetsCreated++;
        checkVitality();
    }
    public void feedPet(int amount) throws PetInactiveException {
        ensureActive();
        health = clamp(health + amount, 0, 100);
        happiness = clamp(happiness + amount / 3, 0, 100);
        checkVitality();
    }
    public void playWithPet(int intensity) throws PetInactiveException {
        ensureActive();
        happiness = clamp(happiness + intensity, 0, 100);
        health = clamp(health - Math.max(0, intensity - 8), 0, 100);
        checkVitality();
    }
    public void healPet(int amount) throws PetInactiveException {
        ensureActive();
        health = clamp(health + amount, 0, 100);
        happiness = clamp(happiness + amount / 4, 0, 100);
        checkVitality();
    }
    public void simulateDay() throws PetInactiveException {
        if (isGhost) return;
        age += 1;
        Random r = new Random();
        int moodSwing = r.nextInt(11) - 5;
        int wellnessSwing = r.nextInt(13) - 6;
        happiness = clamp(happiness + moodSwing, 0, 100);
        health = clamp(health + wellnessSwing, 0, 100);
        if (r.nextDouble() < 0.1) happiness = clamp(happiness - 10, 0, 100);
        if (r.nextDouble() < 0.1) health = clamp(health - 10, 0, 100);
        checkVitality();
    }
    public void evolvePet() throws PetInactiveException {
        ensureActive();
        int index = stageIndex(stage);
        int target = index;
        if (age >= 0 && age < 2) target = 0;
        else if (age < 4) target = 1;
        else if (age < 7) target = 2;
        else if (age < 12) target = 3;
        else if (age < 18) target = 4;
        else target = 5;
        if (health < 30 || happiness < 20) target = Math.max(0, target - 1);
        if (target > index) stage = EVOLUTION_STAGES[target];
    }
    public String getPetStatus() { return isGhost ? "Ghost" : stage; }
    public String getPetId() { return petId; }
    public String getPetName() { return petName; }
    public String getSpecies() { return species; }
    public int getAge() { return age; }
    public int getHappiness() { return happiness; }
    public int getHealth() { return health; }
    public boolean isGhost() { return isGhost; }
    public static String generatePetId() { return UUID.randomUUID().toString(); }
    public static int getTotalPetsCreated() { return totalPetsCreated; }
    private static String randomSpecies() { return SPECIES_POOL.get(new Random().nextInt(SPECIES_POOL.size())); }
    private static int clamp(int v, int lo, int hi) { return Math.max(lo, Math.min(hi, v)); }
    private static String normalizeStage(String s) {
        for (String e : EVOLUTION_STAGES) if (e.equalsIgnoreCase(s)) return e;
        return "Egg";
    }
    private static int stageIndex(String s) {
        for (int i = 0; i < EVOLUTION_STAGES.length; i++) if (EVOLUTION_STAGES[i].equalsIgnoreCase(s)) return i;
        return 0;
    }
    private void checkVitality() {
        if (health <= 0) {
            isGhost = true;
            species = "Ghost";
            stage = "Ghost";
            happiness = 0;
        }
    }
    private void ensureActive() throws PetInactiveException {
        if (isGhost) throw new PetInactiveException("Pet is a Ghost");
    }
    @Override public String toString() {
        return petName + " [" + petId.substring(0, 8) + "] " + species + " Age=" + age + " Health=" + health + " Happiness=" + happiness + " Stage=" + getPetStatus();
    }
}

class PetDaycare {
    private final String daycareName;
    private final List<VirtualPet> pets = new ArrayList<>();
    public PetDaycare(String daycareName) { this.daycareName = daycareName; }
    public void addPet(VirtualPet pet) { pets.add(pet); }
    public List<VirtualPet> getAllPets() { return Collections.unmodifiableList(pets); }
    public void printReport() {
        System.out.println(daycareName);
        for (VirtualPet p : pets) System.out.println(p.toString());
        Map<String, Long> byStage = new LinkedHashMap<>();
        for (VirtualPet p : pets) byStage.merge(p.getPetStatus(), 1L, Long::sum);
        System.out.println("By Status: " + byStage);
    }
}
