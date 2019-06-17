package backend;

import com.blade.Blade;
 
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.Criteria;
import org.hibernate.criterion.Restrictions;

import java.util.List;

public class App {

    private static SessionFactory sessionFactory;
    private static ServiceRegistry serviceRegistry;

    public static void main(String[] args) {

        Configuration conf = new Configuration();
        conf.addAnnotatedClass(User.class);
        conf.configure();
        serviceRegistry = new StandardServiceRegistryBuilder().applySettings(conf.getProperties()).build();
        sessionFactory = conf.buildSessionFactory(serviceRegistry);

        try {
            sessionFactory = conf.buildSessionFactory(serviceRegistry);
        } catch (Exception e) {
            System.err.println("Initial SessionFactory creation failed." + e);
            throw new ExceptionInInitializerError(e);
        }  

        Blade server = Blade.of();

        server.get("/api", ctx -> {
            ctx.text("Hello World!");
        });

        server.get("/api/register", ctx -> {
            String username = ctx.fromString("username");
            String password = ctx.fromString("password");
            String confirmPassword = ctx.fromString("confirmPassword");
            Session session = sessionFactory.openSession();
            Criteria criteria = session.createCriteria(User.class);
            criteria.add(Restrictions.eq("username", username));
            List<User> results = criteria.list();
            if (username == null || username.length() == 0) {
                ctx.json("{success:false,warning:'Username is required'}");
            } else if (password == null || password.length() == 0) {
                ctx.json("{success:false,warning:'Password is required'}");
            } else if (results.size() > 0) {
                ctx.json("{success:false,warning:'That username is taken'}");
            } else if (!password.equals(confirmPassword)) {
                ctx.json("{success:false,warning:'Passwords must match'}");
            } else {
                session.beginTransaction();
                session.save(new User(username, password));
                session.getTransaction().commit();
                session.close();
                System.out.println("created user: " + username + " " + password);
                ctx.json("{success:true,warning:''}");
            }
        });

        server.get("/api/login", ctx -> {
            String username = ctx.fromString("username");
            String password = ctx.fromString("password");
            System.out.println("Attempted login with: " + username + ", " + password);
            Session session = sessionFactory.openSession();
            Criteria criteria = session.createCriteria(User.class);
            criteria.add(Restrictions.eq("username", username));
            List<User> results = criteria.list();
            if (username == null || username.length() == 0) {
                ctx.json("{success:false,warning:'Username is required'}");
            } else if (password == null || password.length() == 0) {
                ctx.json("{success:false,warning:'Password is required'}");
            } else if (results.size() == 0 || !results.get(0).getPassword().equals(password)) {
                ctx.json("{success:false,warning:'Invalid login'}");
            } else {
                ctx.json("{success:true,warning:''}");
            }
            session.close();
        });

        server.listen(3000)
            .start();

        Runtime.getRuntime().addShutdownHook(new Thread() { 
            public void run() 
            { 
                System.out.println("Shutdown Hook is running !"); 
                sessionFactory.close();
            } 
        }); 
    }
}
