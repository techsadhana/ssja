package com.ssja.smarttutor.sessions;
import org.springframework.web.bind.annotation.*;import org.springframework.http.ResponseEntity;import java.util.*;
@RestController @RequestMapping("/api/sessions") public class SessionController{
 private final SessionAuth auth;private final SessionService service;public SessionController(SessionAuth a,SessionService s){auth=a;service=s;}
 @GetMapping public Object list(@RequestHeader(value="Authorization",required=false)String h){return service.list(auth.require(h));}
 @PostMapping public Object publish(@RequestHeader(value="Authorization",required=false)String h,@RequestBody ScheduledSession s){return service.publish(auth.require(h,"TUTOR").id(),s);}
 @PostMapping("/{id}/book")public Object book(@RequestHeader(value="Authorization",required=false)String h,@PathVariable Long id,@RequestBody(required=false) Map<String,String> body){return service.enroll(id,auth.require(h,"STUDENT").id(),body==null?null:body.get("studentAddress"));}
 @PostMapping("/{id}/decision")public Object decision(@RequestHeader(value="Authorization",required=false)String h,@PathVariable Long id,@RequestBody Map<String,Boolean> body){if(body.get("accept")==null)throw new IllegalArgumentException("Choose accept or reject");service.decide(id,auth.require(h,"TUTOR").id(),body.get("accept"));return Map.of("message","Request processed");}
 @DeleteMapping("/{id}/book")public Object release(@RequestHeader(value="Authorization",required=false)String h,@PathVariable Long id){service.release(id,auth.require(h,"STUDENT").id());return Map.of("message","Booking cancelled");}
 @PostMapping("/{id}/announce")public Object announce(@RequestHeader(value="Authorization",required=false)String h,@PathVariable Long id,@RequestBody Map<String,Object>b){return Map.of("recipients",service.announce(id,auth.require(h,"TUTOR").id(),(String)b.get("message"),Boolean.TRUE.equals(b.get("cancel"))));}
 @GetMapping("/notifications")public Object inbox(@RequestHeader(value="Authorization",required=false)String h){return service.inbox(auth.require(h,"STUDENT").id());}
 @PatchMapping("/notifications/{id}/read")public Object read(@RequestHeader(value="Authorization",required=false)String h,@PathVariable Long id){service.markRead(id,auth.require(h,"STUDENT").id());return Map.of("message","Read");}
 @ExceptionHandler(IllegalArgumentException.class)public ResponseEntity<?> invalid(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}
}
