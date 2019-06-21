# LiveSprite
Pixel art animator 

## Frontend

Made with React

Run with:
```bash
$ cd frontend
$ npm i
$ npm start
```

## Backend

Made with Java 8:
- Blade Framework for routing
- Hibernate for ORM
- MySQL for database

Make sure you have a MySQL server running locally with the username `root` and password `root` (or modify hibernate.cfg.xml with credentials to use)

Run with:
```bash
$ cd backend
$ mysql -u root -p < setup_db.sql
$ gradle run
```
