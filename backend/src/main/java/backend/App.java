package backend;

import com.blade.Blade;
import com.blade.mvc.http.Body;
import com.blade.mvc.http.ByteBody;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.Criteria;
import org.hibernate.criterion.Restrictions;
import org.hibernate.criterion.Order;
import org.hibernate.engine.jdbc.BlobProxy;

import java.util.List;

import java.io.File;
import java.sql.Blob;
import java.sql.SQLException;

import java.util.stream.Collectors;
import java.util.Collections;

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
            criteria.addOrder(Order.asc("id"));
            List<User> results = criteria.list();
            String response = "[ ";
            List<Animation> anims = results.get(0).getAnimations().stream().collect(Collectors.toList());
            Collections.sort(anims, (o1, o2) -> (int) (o1.getId() - o2.getId()));
            for (Animation anim : anims) {
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

        server.delete("/api/animation/:anim_id", ctx -> {
            long uid = Long.parseLong(ctx.cookie("user_id"));
            long animId = ctx.pathLong(":anim_id");
            Session session = sessionFactory.openSession();
            Criteria criteria = session.createCriteria(Animation.class);
            criteria.add(Restrictions.eq("id", animId));
            List<Animation> results = criteria.list();
            Animation anim = results.get(0);
            if (anim.getOwner().getId() == uid) {
                session.beginTransaction();
                session.delete(anim);
                session.getTransaction().commit();
            }
            session.close();
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

        server.get("/api/gif/animation/:anim_id", ctx -> {
            long uid = Long.parseLong(ctx.cookie("user_id"));
            // ctx.pathLong sometimes gives the wrong output
            //long animId = ctx.pathLong(":anim_id");
            String uri = ctx.uri();
            String[] parts = uri.split("/");
            String aid = parts[parts.length - 1];
            Session session = sessionFactory.openSession();
            Criteria criteria = session.createCriteria(Animation.class);
            criteria.add(Restrictions.eq("id", Long.parseLong(aid)));
            List<Animation> results = criteria.list();
            Animation anim = results.get(0);
            if (anim.getOwner().getId() != uid) {
                ctx.text("Must own project");
            } else {
                ctx.contentType("image/gif");
                Blob blob = anim.getGif();
                try {
                    // turn blob into byte array (from start to end)
                    byte[] bytes = blob.getBytes(1, (int) blob.length());
                    // send byte array in response
                    ctx.body(ByteBody.of(bytes));
                    System.out.println("ANIM ID SHOULD BE: " + aid);
                    System.out.println("ANIM ID: " + anim.getId());
                } catch (SQLException e) { }
            }
            session.close();
        });

        server.post("/api/gif/animation/:anim_id", ctx -> {
            long uid = Long.parseLong(ctx.cookie("user_id"));
            long animId = ctx.pathLong(":anim_id");
            Session session = sessionFactory.openSession();
            Criteria criteria = session.createCriteria(Animation.class);
            criteria.add(Restrictions.eq("id", animId));
            List<Animation> results = criteria.list();
            Animation anim = results.get(0);
            if (anim.getOwner().getId() != uid) {
                ctx.json("Must own project to save");
            } else {
                session.beginTransaction();
                ctx.request().fileItem("image").ifPresent(fileItem -> {
                    // if the file exists, create a blob using the file's byte array
                    // turn fileitem into a byte array
                    byte[] bytes = fileItem.getData();
                    // create a blob out of the byte array
                    Blob blob = BlobProxy.generateProxy(bytes);
                    anim.setGif(blob);
                });
                session.save(anim);
                session.getTransaction().commit();
                ctx.json("Saved successfully");
            }
            session.close();
        });

        server.listen(PORT).start();
    }
}
