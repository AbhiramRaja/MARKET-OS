class Game {
    String name;
    Game(String name) {
        this.name = name;
    }
    public String toString() {
        return "Game: " + name;
    }
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Game)) return false;
        Game g = (Game) o;
        return name.equals(g.name);
    }
    public int hashCode() {
        return name.hashCode();
    }
}

class CardGame extends Game {
    int cards;
    CardGame(String name, int cards) {
        super(name);
        this.cards = cards;
    }
    public String toString() {
        return super.toString() + ", Cards: " + cards;
    }
    public boolean equals(Object o) {
        if (!super.equals(o)) return false;
        if (!(o instanceof CardGame)) return false;
        CardGame cg = (CardGame) o;
        return cards == cg.cards;
    }
    public int hashCode() {
        return super.hashCode() + cards;
    }
    public static void main(String[] args) {
        Game g1 = new Game("Chess");
        Game g2 = new Game("Chess");
        CardGame cg1 = new CardGame("Poker", 52);
        CardGame cg2 = new CardGame("Poker", 52);
        System.out.println(g1.equals(g2));
        System.out.println(cg1.equals(cg2));
        System.out.println(cg1);
    }
}
