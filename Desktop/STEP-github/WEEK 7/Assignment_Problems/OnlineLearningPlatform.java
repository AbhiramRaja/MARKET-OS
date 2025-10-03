class Course {
    protected String title;
    protected String instructor;
    protected String enrollmentDate;
    public Course(String title, String instructor, String enrollmentDate) {
        this.title = title;
        this.instructor = instructor;
        this.enrollmentDate = enrollmentDate;
    }
    public void displayProgress() {
        System.out.println("Course: " + title + " by " + instructor);
    }
}
class VideoCourse extends Course {
    private int completion;
    private int watchTime;
    public VideoCourse(String title, String instructor, String enrollmentDate, int completion, int watchTime) {
        super(title, instructor, enrollmentDate);
        this.completion = completion;
        this.watchTime = watchTime;
    }
    @Override
    public void displayProgress() {
        System.out.println("Video course: " + completion + "% completed, " + watchTime + " mins watched");
    }
}
class InteractiveCourse extends Course {
    private int quizScore;
    private int projects;
    public InteractiveCourse(String title, String instructor, String enrollmentDate, int quizScore, int projects) {
        super(title, instructor, enrollmentDate);
        this.quizScore = quizScore;
        this.projects = projects;
    }
    @Override
    public void displayProgress() {
        System.out.println("Interactive course: Quiz Score " + quizScore + ", Projects completed: " + projects);
    }
}
class ReadingCourse extends Course {
    private int pagesRead;
    private int notes;
    public ReadingCourse(String title, String instructor, String enrollmentDate, int pagesRead, int notes) {
        super(title, instructor, enrollmentDate);
        this.pagesRead = pagesRead;
        this.notes = notes;
    }
    @Override
    public void displayProgress() {
        System.out.println("Reading course: Pages read " + pagesRead + ", Notes taken: " + notes);
    }
}
class CertificationCourse extends Course {
    private int attempts;
    private boolean certified;
    public CertificationCourse(String title, String instructor, String enrollmentDate, int attempts, boolean certified) {
        super(title, instructor, enrollmentDate);
        this.attempts = attempts;
        this.certified = certified;
    }
    @Override
    public void displayProgress() {
        System.out.println("Certification course: Attempts " + attempts + ", Certified: " + certified);
    }
}
public class OnlineLearningPlatform {
    public static void main(String[] args) {
        Course[] courses = {
            new VideoCourse("Java Basics", "Alice", "2025-01-10", 80, 300),
            new InteractiveCourse("Python Projects", "Bob", "2025-02-01", 90, 4),
            new ReadingCourse("Algorithms", "Carol", "2025-01-20", 120, 15),
            new CertificationCourse("AWS Cloud", "Dave", "2025-03-01", 2, true)
        };
        for (Course c : courses) c.displayProgress();
    }
}
