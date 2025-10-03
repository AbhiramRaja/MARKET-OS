class Entertainment {
    protected String title;
    public Entertainment(String title) {
        this.title = title;
    }
    public void start() {
        System.out.println("Starting " + title);
    }
    public void stop() {
        System.out.println("Stopping " + title);
    }
}
class Movie extends Entertainment {
    private String genre;
    public Movie(String title, String genre) {
        super(title);
        this.genre = genre;
    }
    public void showSubtitles() {
        System.out.println("Showing subtitles for " + title + " (" + genre + ")");
    }
    public void adjustQuality() {
        System.out.println("Adjusting video quality for " + title);
    }
}
class Game extends Entertainment {
    private String platform;
    public Game(String title, String platform) {
        super(title);
        this.platform = platform;
    }
    public void saveProgress() {
        System.out.println("Saving " + title + " progress on " + platform);
    }
    public void showLeaderboard() {
        System.out.println(title + " leaderboard on " + platform);
    }
}
public class EntertainmentHub {
    public static void main(String[] args) {
        Entertainment e = new Movie("Avengers", "Action");
        e.start();
        Movie m = (Movie) e;
        m.showSubtitles();
        m.adjustQuality();
        e = new Game("FIFA 24", "PlayStation");
        e.start();
        Game g = (Game) e;
        g.saveProgress();
        g.showLeaderboard();
    }
}

