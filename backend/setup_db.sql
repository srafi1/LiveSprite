create table user (
    user_id int auto_increment, 
    username varchar(20) not null, 
    password varchar(20) not null, 
    primary key (user_id)
);

create table animation (
    id int auto_increment,
    user_id int not null,
    name varchar(20) not null,
    data text not null,
    PRIMARY KEY (id),
    CONSTRAINT
    FOREIGN KEY (user_id)
    REFERENCES user (user_id)
) engine=InnoDB;
