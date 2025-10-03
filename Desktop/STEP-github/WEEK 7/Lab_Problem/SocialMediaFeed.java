class Post {
    String author, content, time;
    Post(String a, String c, String t) {
        author = a; content = c; time = t;
    }
    void display() {
        System.out.println(author + " posted: " + content + " at " + time);
    }
}
class InstagramPost extends Post {
    InstagramPost(String a, String c, String t) { super(a, c, t); }
    void display() {
        System.out.println(author + " (Instagram): " + content + " #fun #life | Likes: 100");
    }
}
class TwitterPost extends Post {
    TwitterPost(String a, String c, String t) { super(a, c, t); }
    void display() {
        System.out.println(author + " (Twitter): " + content + " | Chars: " + content.length() + " | Retweets: 50");
    }
}
class LinkedInPost extends Post {
    LinkedInPost(String a, String c, String t) { super(a, c, t); }
    void display() {
        System.out.println(author + " (LinkedIn): " + content + " | Seen by 200 connections");
    }
}
class SocialMediaFeed {
    public static void main(String[] args) {
        Post p1 = new InstagramPost("Alice", "Enjoying vacation", "10AM");
        Post p2 = new TwitterPost("Bob", "Java coding fun!", "11AM");
        Post p3 = new LinkedInPost("Clara", "Networking matters", "12PM");
        p1.display();
        p2.display();
        p3.display();
    }
}
