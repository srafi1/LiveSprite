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
    private static final int PORT = 5000;

    public static void main(String[] args) {
        Configuration conf = new Configuration();
        conf.addAnnotatedClass(User.class);
        conf.addAnnotatedClass(Animation.class);
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
            ctx.text("LiveSprite API");
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
                ctx.json("{\"success\":false,\"warning\":\"Username is required\"}");
            } else if (password == null || password.length() == 0) {
                ctx.json("{\"success\":false,\"warning\":\"Password is required\"}");
            } else if (results.size() > 0) {
                ctx.json("{\"success\":false,\"warning\":\"That username is taken\"}");
            } else if (!password.equals(confirmPassword)) {
                ctx.json("{\"success\":false,\"warning\":\"Passwords must match\"}");
            } else {
                session.beginTransaction();
                session.save(new User(username, password));
                session.getTransaction().commit();
                System.out.println("created user: " + username + " " + password);
                Criteria criteria2 = session.createCriteria(User.class);
                criteria2.add(Restrictions.eq("username", username));
                results = criteria2.list();
                ctx.cookie("user_id", String.valueOf(results.get(0).getId()));
                ctx.json("{\"success\":true,\"uid\":\"" + results.get(0).getId() + "\"}");
            }
            session.close();
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
                ctx.json("{\"success\":false,\"warning\":\"Username is required\"}");
            } else if (password == null || password.length() == 0) {
                ctx.json("{\"success\":false,\"warning\":\"Password is required\"}");
            } else if (results.size() == 0 || !results.get(0).getPassword().equals(password)) {
                ctx.json("{\"success\":false,\"warning\":\"Invalid login\"}");
            } else {
                ctx.cookie("user_id", String.valueOf(results.get(0).getId()));
                ctx.json("{\"success\":true,\"uid\":\"" + results.get(0).getId() + "\"}");
            }
            session.close();
        });

        server.post("/api/new", ctx -> {
            long uid = Long.parseLong(ctx.cookie("user_id"));
            String data = ctx.request().bodyToString();
            Session session = sessionFactory.openSession();
            Criteria criteria = session.createCriteria(User.class);
            criteria.add(Restrictions.eq("id", uid));
            List<User> results = criteria.list();
            if (results.size() == 0) {
                ctx.json("{\"success\":false,\"warning\":\"no user id found\"}");
            } else {
                Animation anim = new Animation(results.get(0), "New Project", data);
                session.beginTransaction();
                session.save(anim);
                session.getTransaction().commit();
                ctx.json("{\"success\":true,\"anim_id\":" + anim.getId() + "}");
            }
            session.close();
        });

        server.get("/api/animations", ctx -> {
            long uid = Long.parseLong(ctx.cookie("user_id"));
            Session session = sessionFactory.openSession();
            Criteria criteria = session.createCriteria(User.class);
            criteria.add(Restrictions.eq("id", uid));
            List<User> results = criteria.list();
            //Animation[] anims = results.get(0).getAnimations().toArray();
            String response = "[ ";
            for (Animation anim : results.get(0).getAnimations()) {
                response += anim.getJSON() + ",";
            }
            response = response.substring(0, response.length()-1) + "]";
            ctx.json(response);
            session.close();
        });

        server.get("/api/animation/:anim_id", ctx -> {
            long uid = Long.parseLong(ctx.cookie("user_id"));
            long animId = ctx.pathLong(":anim_id");
            Session session = sessionFactory.openSession();
            Criteria criteria = session.createCriteria(Animation.class);
            criteria.add(Restrictions.eq("id", animId));
            List<Animation> results = criteria.list();
            Animation anim = results.get(0);
            if (anim.getOwner().getId() != uid) {
                ctx.json("{\"success\":false,\"warning\":\"Unauthorized\"}");
            } else {
                ctx.json("{\"success\":true,\"animation\":" + anim.getData() + "}");
            }
        });

        server.post("/api/animation/:anim_id/:new_anim_name", ctx -> {
            long uid = Long.parseLong(ctx.cookie("user_id"));
            long animId = ctx.pathLong(":anim_id");
            String data = ctx.request().bodyToString();
            String animName = ctx.pathString(":new_anim_name");
            Session session = sessionFactory.openSession();
            Criteria criteria = session.createCriteria(Animation.class);
            criteria.add(Restrictions.eq("id", animId));
            List<Animation> results = criteria.list();
            Animation anim = results.get(0);
            if (anim.getOwner().getId() != uid) {
                ctx.json("Must own project to save");
            } else {
                session.beginTransaction();
                anim.setData(data);
                anim.setName(animName);
                session.save(anim);
                session.getTransaction().commit();
                ctx.json("Saved successfully");
            }
            session.close();
        });

        server.listen(PORT).start();
    }
}