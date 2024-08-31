
class EnvParser {
    static parse(data, initial = {}){
        return data.split("\n").reduce((accumulator, current)=>{
            if(!current) return accumulator
            if(current.length == 0) return accumulator
            if(/^\#/.test(current)) return accumulator
            const kv = current.split("=")
            accumulator[kv[0]] = kv[1].replace(/^"/, "").replace(/"$/, "")
            return accumulator
        }, initial)
    }
}
export default EnvParser