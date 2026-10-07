package com.ssja.smarttutor.sessions;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.concurrent.ConcurrentHashMap;
import java.time.Instant;
import java.util.UUID;
@Component public class SessionAuth {
 public record User(Long id,String role,Instant expires){}
 private final ConcurrentHashMap<String,User> tokens=new ConcurrentHashMap<>();
 public String issue(Long id,String role){tokens.entrySet().removeIf(e->e.getValue().expires().isBefore(Instant.now()));String t=UUID.randomUUID().toString()+UUID.randomUUID();tokens.put(t,new User(id,role,Instant.now().plusSeconds(43200)));return t;}
 public User require(String h){User u=h!=null && h.startsWith("Bearer ")?tokens.get(h.substring(7)):null;if(u==null || u.expires().isBefore(Instant.now()))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Please log in again");return u;}
 public User require(String h,String role){User u=require(h);if(!u.role().equals(role))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Requires "+role+" account");return u;}
}
