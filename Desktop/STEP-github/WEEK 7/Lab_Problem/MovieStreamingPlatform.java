class Content {
    String title;
    Content(String t) { title = t; }
}
class Movie extends Content {
    int rating; int duration;
    Movie(String t, int r, int d) { super(t); rating = r; duration = d; }
    void showMovieDetails() { System.out.println(title + " | Rating: " + rating + " | Duration: " + duration); }
}
class TVSeries extends Content {
    int seasons; int episodes;
    TVSeries(String t, int s, int e) { super(t); seasons = s; episodes = e; }
    void showSeriesDetails() { System.out.println(title + " | Seasons: " + seasons + " | Episodes: " + episodes); }
}
class Documentary extends Content {
    String tag;
    Documentary(String t, String tg) { super(t); tag = tg; }
    void showDocDetails() { System.out.println(title + " | Tag: " + tag); }
}
class MovieStreamingPlatform {
    public static void main(String[] args) {
        Content c = new Movie("Inception", 5, 150);
        if (c instanceof Movie) ((Movie)c).showMovieDetails();
    }
}
