// KingdomBuilder.java
import java.util.*;

public class KingdomBuilder {
    public static void main(String[] args) {
    List<MagicalStructure> structures = new ArrayList<>();
    structures.add(new WizardTower());
    structures.add(new WizardTower("Azure Spire", 75, "North Ridge", true, 3, new String[]{"Spark", "Barrier"}));
    structures.add(new EnchantedCastle());
    structures.add(new EnchantedCastle("Golden Keep", 60, "Capital", true, 80, true));
    structures.add(new MysticLibrary("Silent Stacks", 40, "East Vale", true, 1000, "Arcanum"));
    structures.add(new DragonLair("Cinder Vault", 90, "Ash Peaks", true, "Fire Drake", 5000));

    System.out.println("Total Magic Power: " + KingdomRules.calculateKingdomMagicPower(structures.toArray(new MagicalStructure[0])));
    System.out.println(KingdomRules.performMagicBattle(structures.get(0), structures.get(5)));
    System.out.println(KingdomRules.performMagicBattle(structures.get(2), structures.get(5))); // ✅ fixed
    System.out.println("Interact T1-Library: " + KingdomRules.canStructuresInteract(structures.get(0), structures.get(4)));
    System.out.println("Interact Castle-Lair: " + KingdomRules.canStructuresInteract(structures.get(2), structures.get(5)));

    KingdomManager manager = new KingdomManager(structures);
    System.out.println("Tax Map: " + manager.calculateTaxes());
    System.out.println("Specialization: " + manager.determineSpecialization());
    manager.applySynergies();
    System.out.println("After Synergies Magic Power: " + KingdomRules.calculateKingdomMagicPower(structures.toArray(new MagicalStructure[0])));
    }
}



abstract class MagicalStructure {
    protected String structureName;
    protected int magicPower;
    protected String location;
    protected boolean isActive;
    public MagicalStructure() { this("Unnamed", 10, "Unknown", true); }
    public MagicalStructure(String structureName) { this(structureName, 20, "Unknown", true); }
    public MagicalStructure(String structureName, int magicPower, String location, boolean isActive) {
        this.structureName = structureName;
        this.magicPower = Math.max(0, magicPower);
        this.location = location;
        this.isActive = isActive;
    }
    public abstract String castMagicSpell();
    public String getStructureName() { return structureName; }
    public int getMagicPower() { return magicPower; }
    public String getLocation() { return location; }
    public boolean isActive() { return isActive; }
    @Override public String toString() { return getClass().getSimpleName() + "(" + structureName + ", " + magicPower + ", " + location + ", " + isActive + ")"; }
}

class WizardTower extends MagicalStructure {
    private int spellCapacity;
    private String[] knownSpells;
    public WizardTower() { this("Wizard Tower", 30, "Frontier", true, 2, new String[]{"Spark"}); }
    public WizardTower(String structureName, int magicPower, String location, boolean isActive) { this(structureName, magicPower, location, isActive, 2, new String[]{"Spark"}); }
    public WizardTower(String structureName, int magicPower, String location, boolean isActive, int spellCapacity, String[] knownSpells) {
        super(structureName, magicPower, location, isActive);
        this.spellCapacity = Math.max(0, spellCapacity);
        this.knownSpells = knownSpells == null ? new String[0] : knownSpells.clone();
    }
    @Override public String castMagicSpell() { return structureName + " casts " + (knownSpells.length == 0 ? "Pulse" : knownSpells[0]); }
    public int getSpellCapacity() { return spellCapacity; }
    public void setSpellCapacity(int v) { this.spellCapacity = Math.max(0, v); }
    public String[] getKnownSpells() { return knownSpells.clone(); }
    public void addSpell(String s) {
        List<String> l = new ArrayList<>(Arrays.asList(knownSpells));
        l.add(s);
        knownSpells = l.toArray(new String[0]);
    }
}

class EnchantedCastle extends MagicalStructure {
    private int defenseRating;
    private boolean hasDrawbridge;
    public EnchantedCastle() { this("Stonehold", 40, "Lowlands", true, 50, false); }
    public EnchantedCastle(String structureName, int magicPower, String location, boolean isActive) { this(structureName, magicPower, location, isActive, 60, true); }
    public EnchantedCastle(String structureName, int magicPower, String location, boolean isActive, int defenseRating, boolean hasDrawbridge) {
        super(structureName, magicPower, location, isActive);
        this.defenseRating = Math.max(0, defenseRating);
        this.hasDrawbridge = hasDrawbridge;
    }
    @Override public String castMagicSpell() { return structureName + " fortifies walls"; }
    public int getDefenseRating() { return defenseRating; }
    public void setDefenseRating(int v) { defenseRating = Math.max(0, v); }
    public boolean hasDrawbridge() { return hasDrawbridge; }
}

class MysticLibrary extends MagicalStructure {
    private int bookCount;
    private String ancientLanguage;
    public MysticLibrary() { this("Hidden Annex", 25, "Forest Edge", true, 200, "Elderic"); }
    public MysticLibrary(String structureName, int magicPower, String location, boolean isActive) { this(structureName, magicPower, location, isActive, 300, "Old Tongue"); }
    public MysticLibrary(String structureName, int magicPower, String location, boolean isActive, int bookCount, String ancientLanguage) {
        super(structureName, magicPower, location, isActive);
        this.bookCount = Math.max(0, bookCount);
        this.ancientLanguage = ancientLanguage;
    }
    @Override public String castMagicSpell() { return structureName + " unveils secret knowledge"; }
    public int getBookCount() { return bookCount; }
    public void setBookCount(int v) { bookCount = Math.max(0, v); }
    public String getAncientLanguage() { return ancientLanguage; }
}

class DragonLair extends MagicalStructure {
    private String dragonType;
    private int treasureValue;
    public DragonLair() { this("Smoulder Pit", 70, "Volcanic Rift", true, "Fire Drake", 2500); }
    public DragonLair(String structureName, int magicPower, String location, boolean isActive) { this(structureName, magicPower, location, isActive, "Wyrm", 1000); }
    public DragonLair(String structureName, int magicPower, String location, boolean isActive, String dragonType, int treasureValue) {
        super(structureName, magicPower, location, isActive);
        this.dragonType = dragonType;
        this.treasureValue = Math.max(0, treasureValue);
    }
    @Override public String castMagicSpell() { return structureName + " unleashes " + dragonType + " roar"; }
    public String getDragonType() { return dragonType; }
    public int getTreasureValue() { return treasureValue; }
}

class KingdomRules {
    public static boolean canStructuresInteract(MagicalStructure s1, MagicalStructure s2) {
        if (!s1.isActive() || !s2.isActive()) return false;
        if ((s1 instanceof WizardTower && s2 instanceof MysticLibrary) || (s2 instanceof WizardTower && s1 instanceof MysticLibrary)) return true;
        if ((s1 instanceof EnchantedCastle && s2 instanceof DragonLair) || (s2 instanceof EnchantedCastle && s1 instanceof DragonLair)) return true;
        if (s1 instanceof WizardTower && s2 instanceof WizardTower) return true;
        return s1.getLocation().equalsIgnoreCase(s2.getLocation());
    }
    public static String performMagicBattle(MagicalStructure attacker, MagicalStructure defender) {
        int a = attacker.getMagicPower();
        int d = defender.getMagicPower();
        if (attacker instanceof WizardTower && defender instanceof MysticLibrary) a += 15;
        if (attacker instanceof EnchantedCastle && defender instanceof DragonLair) d += 30;
        if (attacker instanceof WizardTower && defender instanceof WizardTower) { a += 10; d += 10; }
        String winner = a > d ? attacker.getStructureName() : d > a ? defender.getStructureName() : "Stalemate";
        return "Battle: " + attacker.castMagicSpell() + " vs " + defender.castMagicSpell() + " -> " + winner;
    }
    public static int calculateKingdomMagicPower(MagicalStructure[] structures) {
        int sum = 0;
        for (MagicalStructure s : structures) sum += s.isActive() ? s.getMagicPower() : 0;
        long towers = Arrays.stream(structures).filter(x -> x instanceof WizardTower).count();
        if (towers >= 3) sum += 20;
        boolean hasWL = Arrays.stream(structures).anyMatch(x -> x instanceof WizardTower) && Arrays.stream(structures).anyMatch(x -> x instanceof MysticLibrary);
        if (hasWL) sum += 25;
        boolean hasCD = Arrays.stream(structures).anyMatch(x -> x instanceof EnchantedCastle) && Arrays.stream(structures).anyMatch(x -> x instanceof DragonLair);
        if (hasCD) sum += 30;
        return sum;
    }
}

class KingdomManager {
    private final List<MagicalStructure> structures;
    public KingdomManager(List<MagicalStructure> structures) { this.structures = structures; }
    public Map<String, List<MagicalStructure>> categorize() {
        Map<String, List<MagicalStructure>> m = new LinkedHashMap<>();
        m.put("WizardTower", new ArrayList<>());
        m.put("EnchantedCastle", new ArrayList<>());
        m.put("MysticLibrary", new ArrayList<>());
        m.put("DragonLair", new ArrayList<>());
        for (MagicalStructure s : structures) {
            if (s instanceof WizardTower) m.get("WizardTower").add(s);
            else if (s instanceof EnchantedCastle) m.get("EnchantedCastle").add(s);
            else if (s instanceof MysticLibrary) m.get("MysticLibrary").add(s);
            else if (s instanceof DragonLair) m.get("DragonLair").add(s);
        }
        return m;
    }
    public Map<String, Integer> calculateTaxes() {
        Map<String, Integer> taxes = new LinkedHashMap<>();
        for (MagicalStructure s : structures) {
            int rate = s instanceof EnchantedCastle ? 5 : s instanceof DragonLair ? 8 : s instanceof WizardTower ? 4 : 3;
            taxes.put(s.getStructureName(), Math.max(0, s.getMagicPower() * rate));
        }
        return taxes;
    }
    public String determineSpecialization() {
        Map<String, List<MagicalStructure>> c = categorize();
        int m = c.get("WizardTower").size() + c.get("MysticLibrary").size();
        int d = c.get("EnchantedCastle").size() + c.get("DragonLair").size();
        if (m > d) return "Magic-focused";
        if (d > m) return "Defense-focused";
        return "Balanced";
    }
    public void applySynergies() {
        boolean hasTower = structures.stream().anyMatch(s -> s instanceof WizardTower);
        boolean hasLibrary = structures.stream().anyMatch(s -> s instanceof MysticLibrary);
        if (hasTower && hasLibrary) {
            for (MagicalStructure s : structures) if (s instanceof WizardTower) {
                WizardTower t = (WizardTower) s;
                t.setSpellCapacity(t.getSpellCapacity() * 2);
            }
        }
        boolean hasCastle = structures.stream().anyMatch(s -> s instanceof EnchantedCastle);
        boolean hasLair = structures.stream().anyMatch(s -> s instanceof DragonLair);
        if (hasCastle && hasLair) {
            for (MagicalStructure s : structures) if (s instanceof EnchantedCastle) {
                EnchantedCastle c = (EnchantedCastle) s;
                c.setDefenseRating(c.getDefenseRating() * 3);
            }
        }
        long towers = structures.stream().filter(s -> s instanceof WizardTower).count();
        if (towers >= 2) {
            List<WizardTower> ts = new ArrayList<>();
            for (MagicalStructure s : structures) if (s instanceof WizardTower) ts.add((WizardTower) s);
            int pool = 0;
            for (WizardTower t : ts) pool += t.getSpellCapacity();
            int share = Math.max(1, pool / ts.size());
            for (WizardTower t : ts) t.setSpellCapacity(share);
        }
    }
}
