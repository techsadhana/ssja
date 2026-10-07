const vm=require('vm'),fs=require('fs'),assert=require('assert');
const nodes=new Map();function el(id){if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',className:'',classList:{remove(){}},scrollIntoView(){}});return nodes.get(id);}
const calls=[];let responseData=[];
const context={Auth:{getUser:()=>({id:2,role:'STUDENT',sessionToken:'test-token'})},window:{SMART_TUTOR_API_URL:'http://example.test'},location:{},document:{hidden:true,getElementById:el,querySelector:el},setInterval:()=>{},fetch:async(url,opts)=>{calls.push({url,opts});return {ok:true,json:async()=>url.endsWith('/notifications')?[{id:4,message:'Tutor is unwell <script>',createdAt:'today',read:false}]:responseData};},console};
vm.createContext(context);let source=fs.readFileSync(require('path').join(__dirname,'../frontend/js/sessions.js'),'utf8').replace(/initSessions\(\);\s*$/,'');vm.runInContext(source,context);
(async()=>{
 assert.equal(vm.runInContext('esc("<script> & ")',context),'&lt;script&gt; &amp; ');
 responseData=[{session:{id:1,title:'Java',date:'2026-10-07',startTime:'10:00',endTime:'11:00',kind:'ONE_TO_ONE',mode:'OFFLINE',details:'Room 12',cancelled:false},tutorName:'Tutor',count:0,mine:false,available:true}];
 await vm.runInContext('refreshSessions()',context);assert(el('slots').innerHTML.includes('Book this slot'));assert(el('slots').innerHTML.includes('Your address'));assert(el('notes').innerHTML.includes('&lt;script&gt;'));assert.equal(el('unread').textContent,1);assert.equal(calls[0].opts.headers.Authorization,'Bearer test-token');
 responseData[0].mine=true;responseData[0].available=false;await vm.runInContext('refreshSessions()',context);assert(el('slots').innerHTML.includes('Cancel my booking'));assert(!el('slots').innerHTML.includes('Book this slot'));
 responseData[0].approvalStatus='PENDING';await vm.runInContext('refreshSessions()',context);assert(el('slots').innerHTML.includes('Awaiting tutor approval'));
 responseData[0].session.cancelled=true;await vm.runInContext('refreshSessions()',context);assert(!el('slots').innerHTML.includes('Cancel my booking'));console.log('PASS: safe text rendering, student slot states, notification inbox, unread count, authenticated API requests');
})().catch(e=>{console.error(e);process.exitCode=1;});
