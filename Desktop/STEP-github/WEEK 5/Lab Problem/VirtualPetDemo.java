import java.util.*;

final class PetSpecies {
    private final String speciesName;
    private final String[] evolutionStages;
    private final int maxLifespan;
    private final String habitat;
    public PetSpecies(String name, String[] stages, int lifespan, String habitat) {
        if (name == null || stages == null || stages.length == 0 || lifespan <= 0 || habitat == null)
            throw new IllegalArgumentException();
        this.speciesName = name;
        this.evolutionStages = Arrays.copyOf(stages, stages.length);
        this.maxLifespan = lifespan;
        this.habitat = habitat;
    }
    public String getSpeciesName() { return speciesName; }
    public String[] getEvolutionStages() { return Arrays.copyOf(evolutionStages, evolutionStages.length); }
    public int getMaxLifespan() { return maxLifespan; }
    public String getHabitat() { return habitat; }
    public String toString() { return speciesName + " in " + habitat; }
    public int hashCode() { return Objects.hash(speciesName, maxLifespan, habitat); }
    public boolean equals(Object o) {
        if (!(o instanceof PetSpecies)) return false;
        PetSpecies p=(PetSpecies)o;
        return speciesName.equals(p.speciesName)&&maxLifespan==p.maxLifespan&&habitat.equals(p.habitat);
    }
}

class VirtualPet {
    private final String petId;
    private final PetSpecies species;
    private final long birthTimestamp;
    private String petName;
    private int age,happiness,health;
    protected static final String[] DEFAULT_EVOLUTION_STAGES={"Egg","Baby","Adult"};
    static final int MAX_HAPPINESS=100,MAX_HEALTH=100;
    public static final String PET_SYSTEM_VERSION="2.0";
    public VirtualPet() {
        this("Randomy",new PetSpecies("Default",DEFAULT_EVOLUTION_STAGES,10,"Garden"),0,50,50);
    }
    public VirtualPet(String name) {
        this(name,new PetSpecies("Default",DEFAULT_EVOLUTION_STAGES,10,"Garden"),0,60,60);
    }
    public VirtualPet(String name,PetSpecies species) {
        this(name,species,0,70,70);
    }
    public VirtualPet(String name,PetSpecies species,int age,int happiness,int health) {
        if(name==null||species==null) throw new IllegalArgumentException();
        this.petId=UUID.randomUUID().toString();
        this.species=species;
        this.birthTimestamp=System.currentTimeMillis();
        this.petName=name;
        setAge(age);setHappiness(happiness);setHealth(health);
    }
    public String getPetId(){return petId;}
    public PetSpecies getSpecies(){return species;}
    public long getBirthTimestamp(){return birthTimestamp;}
    public String getPetName(){return petName;}
    public void setPetName(String n){if(n!=null)this.petName=n;}
    public int getAge(){return age;}
    public void setAge(int a){this.age=Math.max(0,a);}
    public int getHappiness(){return happiness;}
    public void setHappiness(int h){this.happiness=validateStat(h);}
    public int getHealth(){return health;}
    public void setHealth(int h){this.health=validateStat(h);}
    public void feedPet(String food){modifyHealth(calculateFoodBonus(food));}
    public void playWithPet(String game){modifyHappiness(calculateGameEffect(game));}
    protected int calculateFoodBonus(String food){return food.equals("meat")?20:10;}
    protected int calculateGameEffect(String game){return game.equals("fetch")?15:5;}
    private void modifyHappiness(int d){setHappiness(Math.min(MAX_HAPPINESS,happiness+d));}
    private void modifyHealth(int d){setHealth(Math.min(MAX_HEALTH,health+d));}
    int[] getInternalState(){return new int[]{age,happiness,health};}
    private int validateStat(int v){return Math.max(0,Math.min(100,v));}
    public String toString(){return petName+"("+species.getSpeciesName()+")";} 
}

public class VirtualPetDemo {
    public static void main(String[] args) {
        PetSpecies dragon=new PetSpecies("Dragon",new String[]{"Egg","Hatchling","Wyrm"},100,"Cave");
        VirtualPet pet=new VirtualPet("Draco",dragon,2,80,90);
        pet.feedPet("meat");
        pet.playWithPet("fetch");
        System.out.println(pet);
        System.out.println(Arrays.toString(pet.getInternalState()));
    }
}
