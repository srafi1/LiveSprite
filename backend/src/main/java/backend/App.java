package backend;

import com.blade.Blade;

public class App {
    public String getGreeting() {
        return "Hello world.";
    }

    public static void main(String[] args) {
        System.out.println(new App().getGreeting());
        Blade.of().get("/", ctx -> ctx.text("Hello World!")).start();
    }
}
