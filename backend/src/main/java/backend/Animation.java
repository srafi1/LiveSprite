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
    @Column(name="id")
    private long id;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User owner;

    @Column(name="name")
    private String name;

    @Column(name="data")
    private String data;

    public Animation() {  }

    public Animation(User nuser, String nname, String ndata) {
        this.owner = nuser;
        this.name = nname;
        this.data = ndata;
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

    public String getData() {
        return data;
    }

    public void setData(String ndata) {
        this.data = ndata;
    }

    public String getJSON() {
        String ret = "{\"name\":\"" + name + "\"";
        ret += ",\"id\":" + id + "}";
        return ret;
    }
}
