package backend;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.JoinColumn;
import javax.persistence.Table;

@Entity
@Table(name = "animation")
public class Animation {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="project_id")
    private long id;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User owner;

    @Column(name="name")
    private String name;

    @Column(name="width")
    private int width;

    @Column(name="height")
    private int height;

    public Animation() {  }

    public Animation(User nuser, String nname, int nwidth, int nheight) {
        this.owner = nuser;
        this.name = nname;
        this.width = nwidth;
        this.height = nheight;
    }

    public long getId() {
        return id;
    }

    public void setId(long nid) {
        this.id = nid;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User nowner) {
        this.owner = nowner;
    }

    public String getName() {
        return name;
    }

    public void setName(String nname) {
        this.name = nname;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int nwidth) {
        this.width = nwidth;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int nheight) {
        this.height = nheight;
    }
}
