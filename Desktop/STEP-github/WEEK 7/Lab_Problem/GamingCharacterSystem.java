class Character {
    void attack() { System.out.println("Generic attack"); }
}
class Warrior extends Character {
    void attack() { System.out.println("Warrior attacks with sword and shields!"); }
}
class Mage extends Character {
    void attack() { System.out.println("Mage casts a powerful spell!"); }
}
class Archer extends Character {
    void attack() { System.out.println("Archer shoots arrows from distance!"); }
}
class GamingCharacterSystem {
    public static void main(String[] args) {
        Character[] army = {new Warrior(), new Mage(), new Archer()};
        for (Character c : army) c.attack();
    }
}
