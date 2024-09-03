import dns from 'node:dns'

class MxRecord {
    constructor(obj){
        this.exchange = obj.exchange
        this.priority = obj.priority
    }
    toString(){
        return `MX: ${this.exchange} @ ${this.priority}`
    }
}
class SoaRecord {
    constructor(obj){
        this.nsname = obj.nsname
        this.hostmaster = obj.hostmaster
        this.serial = obj.serial
        this.refresh = obj.refresh
        this.retry = obj.retry
        this.expire = obj.expire
        this.minttl = obj.minttl
    }
    toString(){
        return `SOA: ${this.nsname} ${this.hostmaster} minttl: ${this.minttl} retry: ${this.retry} expire: ${this.expire}`
    }
}
class IpAddress {
    constructor(ip){
        this.ip = ip
    }
    toString(){
        return `IP: ${this.ip}`
    }
}
class DomainName {
    constructor(name){
        this.name = name
    }
    toString(){
        return `NAME: ${this.name}`
    }
}
class TxtRecord {
    constructor(txt){
        this.txt = txt
    }
    toString(){
        return `TXT: ${this.txt}`
    }
}
class CaaRecord {
    constructor(obj){
        this.critical = obj.critical
        this.issue = obj.issue
    }
    toString(){
        return `CAA: issue: ${this.issue} critical: ${this.critical}`
    }
}
const makeDnsRecord = obj => {
    if(undefined != obj.exchange){
        return new MxRecord(obj)
    }
    if(undefined != obj.nsname){
        return new SoaRecord(obj)
    }
    if(undefined != obj.critical){
        return new CaaRecord(obj)
    }
    
    if(Array.isArray(obj)){
        for(let o of obj){
            return makeDnsRecord(o)
        }
    } else if(typeof obj == 'string' && /^\d+\.\d+\.\d+\.\d+$/.test(obj)){
        return new IpAddress(obj)
    } else if(!/\s+/.test(obj)){
        return new DomainName(obj)
    }
    return new TxtRecord(obj)
}
const makeDnsRecords = addresses => {
    if(!Array.isArray(addresses)) {
        return [makeDnsRecord(addresses)]
    }
    return addresses.map(makeDnsRecord)
}

const getHostEntries = async name => {
    return await Promise.all([
        new Promise((resolve, reject)=>{
            dns.resolve4(name, (err, addresses)=>{
                if(err) resolve({err, addresses: []})
                else resolve({err: null,  addresses: makeDnsRecords(addresses), from: 'resolve4'})
            })
        }),

        new Promise((resolve, reject)=>{
            dns.resolve6(name, (err, addresses)=>{
                if(err) resolve({err, addresses: []})
                else resolve({err: null,  addresses: makeDnsRecords(addresses), from: 'resolve6'})
            })
        }),

        new Promise((resolve, reject)=>{
            dns.resolveCaa(name, (err, addresses)=>{
                if(err) resolve({err, addresses: []})
                else resolve({err: null,  addresses: makeDnsRecords(addresses), from: 'resolveCaa'})
            })
        }),

        new Promise((resolve, reject)=>{
            dns.resolveMx(name, (err, addresses)=>{
                if(err) resolve({err, addresses: []})
                else resolve({err: null,  addresses: makeDnsRecords(addresses), from: 'resolveMx'})
            })
        }),

        new Promise((resolve, reject)=>{
            dns.resolveNaptr(name, (err, addresses)=>{
                if(err) resolve({err, addresses: []})
                else resolve({err: null,  addresses: makeDnsRecords(addresses), from: 'resolveNaptr'})
            })
        }),
        new Promise((resolve, reject)=>{
            dns.resolveNs(name, (err, addresses)=>{
                if(err) resolve({err, addresses: []})
                else resolve({err: null,  addresses: makeDnsRecords(addresses), from: 'resolveNs'})
            })
        }),
        new Promise((resolve, reject)=>{
            dns.resolveSoa(name, (err, addresses)=>{
                if(err) resolve({err, addresses: []})
                else resolve({err: null,  addresses: makeDnsRecords(addresses), from: 'resolveSoa'})
            })
        }),

        new Promise((resolve, reject)=>{
            dns.resolveSrv(name, (err, addresses)=>{
                if(err) resolve({err, addresses: []})
                else resolve({err: null,  addresses: makeDnsRecords(addresses), from: 'resolveSrv'})
            })
        }),

        new Promise((resolve, reject)=>{
            dns.resolveTxt(name, (err, addresses)=>{
                if(err) resolve({err, addresses: []})
                else resolve({err: null,  addresses: makeDnsRecords(addresses), from: 'resolveTxt'})
            })
        }),
    ])
}
export {
    makeDnsRecord,
    makeDnsRecords,
    getHostEntries,
    TxtRecord,
    MxRecord,
    SoaRecord,
    DomainName,
    IpAddress,
    CaaRecord,
}