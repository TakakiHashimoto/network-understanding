import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTarget, ipNumber, prefixMatches, longestPrefix, transmissionTime, congestionStep, dnsTrace } from '../src/model.js';

test('URL handling preserves paths and rejects unsupported or credentialed targets',()=>{
 assert.equal(normalizeTarget('reactbits.dev').href,'https://reactbits.dev/');
 assert.equal(normalizeTarget('https://example.com/docs?q=1#foo').path,'/docs?q=1');
 assert.equal(normalizeTarget('javascript:alert(1)'),null);
 assert.equal(normalizeTarget('https://user:password@example.com'),null);
 assert.equal(normalizeTarget('https://exa mple.com'),null);
 assert.equal(normalizeTarget('http://example.com').href,'https://example.com/');
});
test('IPv4 validation and boundary masks /0 and /32',()=>{
 assert.equal(ipNumber('255.255.255.255'),4294967295);
 for(const ip of ['256.0.0.1','1.2.3','1..2.3','1.2.3.-1'])assert.equal(ipNumber(ip),null);
 assert.equal(prefixMatches('0.0.0.0','0.0.0.0/0'),true);
 assert.equal(prefixMatches('255.255.255.255','0.0.0.0/0'),true);
 assert.equal(prefixMatches('203.0.113.80','203.0.113.80/32'),true);
 assert.equal(prefixMatches('203.0.113.81','203.0.113.80/32'),false);
 assert.equal(prefixMatches('203.0.113.255','203.0.113.0/24'),true);
 assert.equal(prefixMatches('203.0.114.0','203.0.113.0/24'),false);
});
test('FIB uses longest match, supports withdrawal, and rejects invalid destinations',()=>{
 const routes=[{prefix:'0.0.0.0/0'},{prefix:'203.0.0.0/8'},{prefix:'203.0.113.0/24'}];
 assert.equal(longestPrefix('203.0.113.80',routes),routes[2]);
 routes[2].enabled=false;
 assert.equal(longestPrefix('203.0.113.80',routes),routes[1]);
 assert.equal(longestPrefix('198.51.100.1',routes),routes[0]);
 assert.equal(longestPrefix('999.0.0.1',routes),null);
});
test('physical delay separates serialization from propagation',()=>{
 const a=transmissionTime(1500,1000,1000),b=transmissionTime(1500,2000,1000);
 assert.equal(a.propagation,5);assert.equal(a.serialization,.012);
 assert.equal(b.propagation,a.propagation);assert.equal(b.serialization,a.serialization/2);
});
test('congestion recovery enters additive growth rather than restarting exponential growth',()=>{
 let s={cwnd:8,threshold:16,history:[1,2,4,8],phase:'Slow start'};
 s=congestionStep(s,'loss',20);assert.equal(s.cwnd,4);assert.equal(s.threshold,4);
 s=congestionStep(s,'ack',20);assert.equal(s.cwnd,5);assert.equal(s.phase,'Congestion avoidance');
 assert.equal(congestionStep({cwnd:8,threshold:16,history:[],phase:'Slow start'},'ack',2).cwnd,10);
});
test('warm DNS cache eliminates external resolution steps',()=>{
 const cold=dnsTrace('example.com',false),warm=dnsTrace('example.com',true);
 assert.equal(cold.length,8);assert.equal(warm.length,2);
 assert.equal(warm.some(e=>e.to==='Root server'),false);
 assert.ok(cold[1].text.includes('.com'));
});
